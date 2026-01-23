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

        // Fetch the show with all required data
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

        // Verify ownership
        if (show.createdBy !== user.id && user.role !== 'ADMIN') {
            return NextResponse.json({ error: "You don't have permission to publish this show" }, { status: 403 })
        }

        // Verify user is verified
        const isVerified = user.role === 'ORGANIZER_VERIFIED' || user.role === 'COMEDIAN_VERIFIED' || user.role === 'ADMIN'
        if (!isVerified) {
            return NextResponse.json({
                error: "Your account must be verified before you can publish shows"
            }, { status: 403 })
        }

        // Validation checks before publishing
        if (show.isPublished) {
            return NextResponse.json({ error: "Show is already published" }, { status: 400 })
        }

        // Must have at least one comedian
        if (show.showComedians.length === 0) {
            return NextResponse.json({
                error: "Show must have at least one comedian before publishing"
            }, { status: 400 })
        }

        // Date must be in future
        if (show.date <= new Date()) {
            return NextResponse.json({
                error: "Show date must be in the future"
            }, { status: 400 })
        }

        // Capacity must be greater than 0
        if (show.totalTickets <= 0) {
            return NextResponse.json({
                error: "Show must have at least 1 ticket"
            }, { status: 400 })
        }

        // Publish the show
        const updatedShow = await prisma.show.update({
            where: { id: showId },
            data: { isPublished: true }
        })

        return NextResponse.json({
            message: "Show published successfully",
            show: updatedShow
        })
    } catch (error) {
        console.error("Error publishing show:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
