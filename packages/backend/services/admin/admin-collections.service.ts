import { prisma } from "@/lib/prisma"
import { ValidationError } from "@/errors"

/**
 * Admin Collections Service
 * Handles financial collections and disbursements
 */
class AdminCollectionsService {
    /**
     * Get collections summary (optionally filtered by show ID)
     */
    async getCollectionsSummary(showId?: string) {
        let shows: any[]

        if (showId) {
            // Single show query
            shows = await prisma.$queryRaw`
                SELECT 
                    s.id, 
                    s.title, 
                    s.date,
                    s."ticketPrice",
                    s."totalTickets",
                    s."isDisbursed",
                    u.email as "creatorEmail",
                    COUNT(b.id) as "totalBookings",
                    COALESCE(SUM(b.quantity), 0) as "ticketsSold",
                    COALESCE(SUM(b."totalAmount"), 0) as "grossRevenue"
                FROM "Show" s
                LEFT JOIN "User" u ON s."creatorId" = u.id
                LEFT JOIN "Booking" b ON s.id = b."showId" AND b.status IN ('CONFIRMED', 'CONFIRMED_UNPAID')
                WHERE s.id = ${showId}
                GROUP BY s.id, u.email
            `
        } else {
            // All published shows
            shows = await prisma.show.findMany({
                where: {
                    isPublished: true
                },
                include: {
                    creator: {
                        select: { email: true }
                    },
                    bookings: {
                        where: {
                            status: { in: ['CONFIRMED', 'CONFIRMED_UNPAID'] }
                        },
                        select: {
                            quantity: true,
                            totalAmount: true
                        }
                    }
                }
            })
        }

        // Get bookings for revenue calculation
        const bookingsList = await prisma.$queryRaw`
            SELECT 
                b."showId",
                b."totalAmount",
                b."bookingFee"
            FROM "Booking" b
            WHERE b.status IN ('CONFIRMED', 'CONFIRMED_UNPAID')
        ` as any[]

        // Get show fees
        const showFees = await prisma.$queryRaw`
            SELECT 
                s.id as "showId",
                s."creatorId",
                s."platformFeePercent",
                cp."customPlatformFee" as "comedianCustomFee",
                op."customPlatformFee" as "organizerCustomFee"
            FROM "Show" s
            LEFT JOIN "User" u ON s."creatorId" = u.id
            LEFT JOIN "ComedianProfile" cp ON u.id = cp."userId"
            LEFT JOIN "OrganizerProfile" op ON u.id = op."userId"
        ` as any[]

        const feeMap = new Map(showFees.map((f: any) => [f.showId, f]))
        const bookingsMap = new Map()

        bookingsList.forEach((b: any) => {
            if (!bookingsMap.has(b.showId)) {
                bookingsMap.set(b.showId, [])
            }
            bookingsMap.get(b.showId).push(b)
        })

        const enrichedShows = shows.map((show: any) => {
            const showBookings = bookingsMap.get(show.id) || []
            const feeInfo = feeMap.get(show.id)

            const grossRevenue = showBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)
            const platformFees = showBookings.reduce((sum: number, b: any) => sum + (b.bookingFee || 0), 0)

            let platformFeePercent = feeInfo?.platformFeePercent || 10
            if (feeInfo?.comedianCustomFee !== null && feeInfo?.comedianCustomFee !== undefined) {
                platformFeePercent = feeInfo.comedianCustomFee
            } else if (feeInfo?.organizerCustomFee !== null && feeInfo?.organizerCustomFee !== undefined) {
                platformFeePercent = feeInfo.organizerCustomFee
            }

            const creatorPayout = grossRevenue - platformFees

            return {
                ...show,
                grossRevenue,
                platformFees,
                platformFeePercent,
                creatorPayout,
                ticketsSold: show.ticketsSold || showBookings.reduce((sum: number, b: any) => sum + (b.quantity || 0), 0)
            }
        })

        return { shows: enrichedShows }
    }

    /**
     * Disburse funds for a show
     */
    async disburseShow(showId: string) {
        if (!showId) {
            throw new ValidationError('Show ID required')
        }

        await prisma.show.update({
            where: { id: showId },
            data: { isDisbursed: true } as any
        })

        return { success: true, message: `Show ${showId} marked as disbursed` }
    }
}

// Export singleton instance
export const adminCollectionsService = new AdminCollectionsService()
