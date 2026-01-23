import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { BookingStatus, UserRole } from "@prisma/client"

export async function GET() {
    try {
        const user = await getCurrentUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify user is verified organizer or comedian
        const isVerified = user.role === UserRole.ORGANIZER_VERIFIED || user.role === UserRole.COMEDIAN_VERIFIED

        if (!isVerified) {
            return NextResponse.json({
                error: "Only verified organizers and comedians can view sales data"
            }, { status: 403 })
        }

        // Fetch all shows created by this user
        const shows = await prisma.show.findMany({
            where: {
                createdBy: user.id
            },
            include: {
                bookings: {
                    where: {
                        status: {
                            in: [BookingStatus.CONFIRMED, BookingStatus.CONFIRMED_UNPAID]
                        }
                    },
                    select: {
                        quantity: true,
                        totalAmount: true
                    }
                },
                ticketInventory: true
            },
            orderBy: {
                date: 'asc'
            }
        })

        // Calculate sales data for each show
        const salesData = shows.map(show => {
            const ticketsSold = show.bookings.reduce((total, booking) => total + booking.quantity, 0)
            const totalRevenue = show.bookings.reduce((total, booking) => total + booking.totalAmount, 0)
            const ticketsRemaining = show.ticketInventory?.[0]?.available || show.totalTickets
            const bookingCount = show.bookings.length

            return {
                showId: show.id,
                title: show.title,
                date: show.date,
                isPublished: show.isPublished,
                totalTickets: show.totalTickets,
                ticketsSold,
                ticketsRemaining,
                ticketPrice: show.ticketPrice,
                totalRevenue,
                bookingCount
            }
        })

        return NextResponse.json({ shows: salesData })
    } catch (error) {
        console.error("Error fetching sales data:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
