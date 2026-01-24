import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/organizer/dashboard
 * 
 * Returns dashboard statistics for organizers:
 * - Total shows created
 * - Upcoming shows count
 * - Total tickets sold
 * - List of upcoming shows
 * 
 * Access: ORGANIZER_VERIFIED, COMEDIAN_VERIFIED, ADMIN
 */
export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json(
                { error: "Not authenticated" },
                { status: 401 }
            )
        }

        // Check if user has organizer or comedian role
        const allowedRoles = ["ORGANIZER_VERIFIED", "COMEDIAN_VERIFIED", "ADMIN"]
        if (!allowedRoles.includes(user.role)) {
            return NextResponse.json(
                { error: "Unauthorized. Must be a verified organizer or comedian." },
                { status: 403 }
            )
        }

        // Fetch all shows created by this user
        const shows = await prisma.show.findMany({
            where: {
                createdBy: user.id
            },
            include: {
                _count: {
                    select: { bookings: true }
                },
                ticketInventory: {
                    select: { available: true }
                }
            },
            orderBy: {
                date: 'asc'
            }
        })

        const now = new Date()

        // Calculate statistics
        const totalShows = shows.length

        // Filter upcoming shows for display, but ensure total stats are correct
        const upcomingShows = shows.filter(show => new Date(show.date) > now)
        const upcomingShowsCount = upcomingShows.length

        // Calculate total tickets sold across all shows
        const ticketsSold = shows.reduce((total, show) => {
            return total + show._count.bookings
        }, 0)

        // Get next 5 upcoming shows with details
        const upcomingShowsList = upcomingShows
            .slice(0, 5)
            .map(show => ({
                id: show.id,
                title: show.title,
                date: show.date,
                venue: show.venue,
                ticketPrice: show.ticketPrice,
                ticketsAvailable: show.ticketInventory?.available || 0,
                totalTickets: show.totalTickets,
                bookingsCount: show._count.bookings
            }))

        return NextResponse.json({
            totalShows,
            upcomingShows: upcomingShowsCount,
            ticketsSold,
            upcomingShowsList
        })

    } catch (error) {
        console.error("Dashboard API error:", error)
        return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 }
        )
    }
}
