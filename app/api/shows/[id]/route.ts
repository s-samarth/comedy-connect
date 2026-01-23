import { getCurrentUser, requireOrganizer } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params

    const show = await prisma.show.findUnique({
      where: { id: resolvedParams.id },
      include: {
        creator: {
          select: { email: true, name: true }
        },
        showComedians: {
          include: {
            comedian: {
              select: { id: true, name: true, bio: true, profileImageUrl: true }
            }
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
    const resolvedParams = await params
    const user = await requireOrganizer()
    const {
      title,
      description,
      date,
      venue,
      ticketPrice,
      totalTickets,
      comedianIds
    } = await request.json()

    // Check if show exists and belongs to this organizer
    const existingShow = await prisma.show.findUnique({
      where: { id: resolvedParams.id },
      include: {
        ticketInventory: true,
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!existingShow) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 })
    }

    if (existingShow.createdBy !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Prevent editing if tickets have been sold
    if (existingShow._count.bookings > 0) {
      return NextResponse.json({
        error: "Cannot edit show with existing bookings"
      }, { status: 400 })
    }

    // Validation
    if (date) {
      const showDate = new Date(date)
      if (showDate <= new Date()) {
        return NextResponse.json({ error: "Show date must be in the future" }, { status: 400 })
      }
    }

    if (totalTickets && totalTickets <= 0) {
      return NextResponse.json({ error: "Total tickets must be greater than 0" }, { status: 400 })
    }

    if (ticketPrice && ticketPrice <= 0) {
      return NextResponse.json({ error: "Ticket price must be greater than 0" }, { status: 400 })
    }

    if (venue && !venue.toLowerCase().includes("hyderabad")) {
      return NextResponse.json({
        error: "Currently only Hyderabad venues are supported"
      }, { status: 400 })
    }

    // Update show and related records in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const show = await tx.show.update({
        where: { id: resolvedParams.id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(date && { date: new Date(date) }),
          ...(venue && { venue }),
          ...(ticketPrice && { ticketPrice }),
          ...(totalTickets && { totalTickets })
        }
      })

      // Update ticket inventory if total tickets changed
      if (totalTickets && existingShow.ticketInventory) {
        const currentBooked = existingShow.totalTickets - existingShow.ticketInventory[0].available
        if (totalTickets < currentBooked) {
          throw new Error("Cannot reduce total tickets below already booked amount")
        }

        await tx.ticketInventory.update({
          where: { showId: resolvedParams.id },
          data: { available: totalTickets - currentBooked }
        })
      }

      // Update comedian associations if provided
      if (comedianIds !== undefined) {
        // Remove existing associations
        await tx.showComedian.deleteMany({
          where: { showId: resolvedParams.id }
        })

        // Add new associations
        if (comedianIds.length > 0) {
          const comedians = await tx.comedian.findMany({
            where: {
              id: { in: comedianIds },
              createdBy: user.id
            }
          })

          if (comedians.length !== comedianIds.length) {
            throw new Error("Some comedians not found or not owned by you")
          }

          const showComedians = comedianIds.map((comedianId: string, index: number) => ({
            showId: resolvedParams.id,
            comedianId,
            order: index
          }))

          await tx.showComedian.createMany({
            data: showComedians
          })
        }
      }

      return show
    })

    return NextResponse.json({ show: result })
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const user = await requireOrganizer()

    // Check if show exists and belongs to this organizer
    const existingShow = await prisma.show.findUnique({
      where: { id: resolvedParams.id },
      include: {
        ticketInventory: true,
        _count: {
          select: { bookings: true }
        }
      }
    })

    if (!existingShow) {
      return NextResponse.json({ error: "Show not found" }, { status: 404 })
    }

    if (existingShow.createdBy !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Prevent deletion if tickets have been sold
    if (existingShow._count.bookings > 0) {
      return NextResponse.json({
        error: "Cannot delete show with existing bookings"
      }, { status: 400 })
    }

    await prisma.show.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: "Show deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
