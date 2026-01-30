import { prisma } from "@/lib/prisma"

export class AdminRepository {
    /**
     * Fetch all shows with creator info (replaces Raw SQL)
     * Using Prisma relations for better type safety, though Raw SQL was used for performance?
     * The original code used Raw SQL to join User and OrganizerProfile.
     * We can achieve this with Prisma include.
     */
    async findAllShowsWithCreator() {
        const shows = await prisma.show.findMany({
            include: {
                creator: {
                    include: {
                        organizerProfile: true,
                        comedianProfile: true
                    }
                },
                bookings: {
                    where: {
                        status: { in: ['CONFIRMED', 'CONFIRMED_UNPAID'] }
                    },
                    select: {
                        quantity: true,
                        totalAmount: true,
                        bookingFee: true,
                        platformFee: true
                    }
                },
                _count: {
                    select: { bookings: true }
                }
            },
            orderBy: { date: 'desc' }
        })

        return shows
    }

    /**
     * Get booking stats for all shows
     */
    async getBookingStats() {
        return prisma.$queryRaw`
          SELECT 
            "showId", 
            SUM("totalAmount") as "revenue", 
            SUM("quantity") as "ticketsSold"
          FROM "Booking"
          WHERE "status" IN ('CONFIRMED', 'CONFIRMED_UNPAID')
          GROUP BY "showId"
        ` as Promise<any[]>
    }

    /**
     * Update platform fee via Raw SQL (as per original implementation)
     */
    async updatePlatformFee(showId: string, fee: number) {
        return prisma.$executeRaw`
          UPDATE "Show" 
          SET "customPlatformFee" = ${fee} 
          WHERE "id" = ${showId}
        `
    }

    /**
     * Update booking fees when show fee changes
     * Recalculates platform fee for all non-terminal bookings
     */
    async updateBookingsFees(showId: string, feePercentage: number) {
        const factor = feePercentage / 100.0
        return prisma.$executeRaw`
            UPDATE "Booking"
            SET "platformFee" = "totalAmount" * ${factor}
            WHERE "showId" = ${showId}
            AND "status" NOT IN ('CANCELLED', 'FAILED')
        `
    }

    /**
     * Set disbursed status
     */
    async setDisbursed(showId: string, isDisbursed: boolean) {
        return prisma.show.update({
            where: { id: showId },
            data: { isDisbursed }
        })
    }
}

export const adminRepository = new AdminRepository()
