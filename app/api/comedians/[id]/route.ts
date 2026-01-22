import { getCurrentUser, requireOrganizer } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const comedian = await prisma.comedian.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: { email: true }
        },
        showComedians: {
          include: {
            show: {
              select: { id: true, title: true, date: true }
            }
          }
        }
      }
    })

    if (!comedian) {
      return NextResponse.json({ error: "Comedian not found" }, { status: 404 })
    }

    return NextResponse.json({ comedian })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireOrganizer()
    const { name, bio, socialLinks, promoVideoUrl } = await request.json()

    // Check if comedian exists and belongs to this organizer
    const existingComedian = await prisma.comedian.findUnique({
      where: { id: params.id }
    })

    if (!existingComedian) {
      return NextResponse.json({ error: "Comedian not found" }, { status: 404 })
    }

    if (existingComedian.createdBy !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const comedian = await prisma.comedian.update({
      where: { id: params.id },
      data: {
        name,
        bio,
        socialLinks,
        promoVideoUrl
      }
    })

    return NextResponse.json({ comedian })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireOrganizer()

    // Check if comedian exists and belongs to this organizer
    const existingComedian = await prisma.comedian.findUnique({
      where: { id: params.id },
      include: {
        showComedians: true
      }
    })

    if (!existingComedian) {
      return NextResponse.json({ error: "Comedian not found" }, { status: 404 })
    }

    if (existingComedian.createdBy !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if comedian is associated with any shows
    if (existingComedian.showComedians.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete comedian associated with shows" 
      }, { status: 400 })
    }

    await prisma.comedian.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Comedian deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
