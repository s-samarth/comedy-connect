import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    const { id: showId } = await params

    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        creator: {
          select: { email: true, role: true }
        },
        showComedians: {
          include: {
            comedian: true
          },
          orderBy: { order: 'asc' }
        },
        ticketInventory: true,
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!show) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 })
    }

    // Visibility check: unpublished shows only visible to creator and admin
    if (!(show as any).isPublished) {
      if (!user || (show.createdBy !== user.id && user.role !== 'ADMIN')) {
        return NextResponse.json({ error: "Show not found" }, { status: 404 })
      }
    }

    return NextResponse.json({ show })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: showId } = await params
    const updates = await request.json()

    // Fetch the show
    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        showComedians: true,
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!show) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 })
    }

    // Verify ownership or admin
    if (show.createdBy !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    // If show is published with bookings, enforce immutability rules
    const hasBookings = show._count.bookings > 0

    if ((show as any).isPublished && hasBookings) {
      // Block price changes
      if (updates.ticketPrice !== undefined && updates.ticketPrice !== show.ticketPrice) {
        return NextResponse.json({
          error: "Cannot change ticket price for a published show with bookings"
        }, { status: 400 })
      }

      // Block capacity increases
      if (updates.totalTickets !== undefined && updates.totalTickets > show.totalTickets) {
        return NextResponse.json({
          error: "Cannot increase capacity for a published show with bookings"
        }, { status: 400 })
      }

      // Block comedian removal
      if (updates.comedianIds !== undefined) {
        const currentComedianIds = show.showComedians.map(sc => sc.comedianId)
        const removedComedians = currentComedianIds.filter(id => !updates.comedianIds.includes(id))

        if (removedComedians.length > 0) {
          return NextResponse.json({
            error: "Cannot remove comedians from a published show with bookings"
          }, { status: 400 })
        }
      }
    }

    // Prepare update data
    const updateData: any = {}

    if (updates.title) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.venue) updateData.venue = updates.venue
    if (updates.googleMapsLink) updateData.googleMapsLink = updates.googleMapsLink
    if (updates.posterImageUrl !== undefined) updateData.posterImageUrl = updates.posterImageUrl
    if (updates.youtubeUrls !== undefined) updateData.youtubeUrls = updates.youtubeUrls
    if (updates.instagramUrls !== undefined) updateData.instagramUrls = updates.instagramUrls

    // Only allow these if not published with bookings
    if (!(show as any).isPublished || !hasBookings) {
      if (updates.date) updateData.date = new Date(updates.date)
      if (updates.ticketPrice !== undefined) updateData.ticketPrice = updates.ticketPrice
      if (updates.totalTickets !== undefined) updateData.totalTickets = updates.totalTickets
    }

    // Update the show
    const updatedShow = await prisma.show.update({
      where: { id: showId },
      data: updateData
    })

    // Handle comedian updates if provided
    if (updates.comedianIds !== undefined) {
      await prisma.showComedian.deleteMany({
        where: { showId }
      })

      if (updates.comedianIds.length > 0) {
        await prisma.showComedian.createMany({
          data: updates.comedianIds.map((comedianId: string, index: number) => ({
            showId,
            comedianId,
            order: index
          }))
        })
      }
    }

    return NextResponse.json({ show: updatedShow })
  } catch (error) {
    console.error("Error updating show:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: showId } = await params

    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!show) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 })
    }

    if (show.createdBy !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 })
    }

    if (show._count.bookings > 0) {
      return NextResponse.json({
        error: `Cannot delete show with ${show._count.bookings} existing booking(s)`
      }, { status: 400 })
    }

    await prisma.show.delete({
      where: { id: showId }
    })

    return NextResponse.json({ message: "Show deleted successfully" })
  } catch (error) {
    console.error("Error deleting show:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
