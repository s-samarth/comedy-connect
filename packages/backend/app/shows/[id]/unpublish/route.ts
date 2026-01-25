import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id: showId } = await params

        // Fetch the show
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

        // Verify ownership or Admin
        if (show.createdBy !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json({ error: "You don't have permission to unpublish this show" }, { status: 403 })
        }

        // Check if show is already unpublished
        if (!show.isPublished) {
            return NextResponse.json({ error: "Show is already unpublished" }, { status: 400 })
        }

        // Check for bookings - cannot unpublish if tickets are sold
        if (show._count.bookings > 0) {
            return NextResponse.json({
                error: "Cannot unpublish a show that has active bookings. Please cancel the show instead."
            }, { status: 400 })
        }

        // Unpublish the show
        const updatedShow = await prisma.show.update({
            where: { id: showId },
            data: { isPublished: false }
        })

        return NextResponse.json({
            message: "Show unpublished successfully",
            show: updatedShow
        })
    } catch (error) {
        console.error("Error unpublishing show:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
