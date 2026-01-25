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

        // Fetch all shows created by this user with booking data
        const shows = await prisma.show.findMany({
            where: {
                createdBy: user.id
            },
            include: {
                bookings: {
                    where: {
                        status: {
                            in: ["CONFIRMED", "CONFIRMED_UNPAID"]
                        }
                    },
                    select: {
                        quantity: true,
                        totalAmount: true
                    }
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

        // Filter upcoming shows
        const upcomingShows = shows.filter(show => new Date(show.date) > now)
        const upcomingShowsCount = upcomingShows.length

        // Calculate totals across all shows
        let totalTicketsSold = 0
        let totalRevenue = 0

        const showsWithStats = shows.map(show => {
            const showTicketsSold = show.bookings.reduce((sum, b) => sum + b.quantity, 0)
            const showRevenue = show.bookings.reduce((sum, b) => sum + b.totalAmount, 0)

            totalTicketsSold += showTicketsSold
            totalRevenue += showRevenue

            return {
                ...show,
                stats: {
                    ticketsSold: showTicketsSold,
                    revenue: showRevenue,
                    bookingsCount: show.bookings.length
                }
            }
        })

        // Get next 5 upcoming shows with details
        const upcomingShowsList = showsWithStats
            .filter(show => new Date(show.date) > now)
            .slice(0, 5)
            .map(show => ({
                id: show.id,
                title: show.title,
                date: show.date,
                venue: show.venue,
                ticketPrice: show.ticketPrice,
                ticketsAvailable: show.ticketInventory?.available || 0,
                totalTickets: show.totalTickets,
                bookingsCount: show.stats.bookingsCount,
                ticketsSold: show.stats.ticketsSold,
                revenue: show.stats.revenue
            }))

        // Also return full list for detailed view if needed, or just summary
        // For the dashboard overview we stick to summary + upcoming

        return NextResponse.json({
            totalShows,
            upcomingShows: upcomingShowsCount,
            ticketsSold: totalTicketsSold,
            totalRevenue,
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
