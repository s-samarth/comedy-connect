import { prisma } from "@/lib/prisma"

/**
 * Admin Stats Service
 * Handles all admin statistics and metrics aggregation
 */
class AdminStatsService {
    /**
     * Get comprehensive system statistics
     */
    async getSystemStats() {
        // 1. Total Users
        const totalUsers = await prisma.user.count()

        // 2. New Users (Last 24h)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const newUsersToday = await prisma.user.count({
            where: {
                createdAt: {
                    gte: yesterday
                }
            }
        })

        // 3. Active Shows
        const activeShows = await prisma.show.count({
            where: {
                isPublished: true,
                date: {
                    gte: new Date()
                }
            }
        })

        // 4. Total Revenue
        const allBookings = await (prisma.booking as any).findMany({
            where: {
                status: { in: ['CONFIRMED', 'CONFIRMED_UNPAID'] }
            },
            select: {
                totalAmount: true,
                bookingFee: true
            }
        })

        const totalRevenue = allBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0) + (b.bookingFee || 0), 0)

        // 5. Pending Approvals
        const pendingOrganizersResult = await prisma.$queryRaw`
            SELECT COUNT(*) as count
            FROM "User" u
            JOIN "OrganizerProfile" op ON u.id = op."userId"
            WHERE u.role = 'ORGANIZER_UNVERIFIED'
            AND NOT EXISTS (
                SELECT 1 FROM "OrganizerApproval" oa 
                WHERE oa."organizerId" = op.id 
                AND oa.status = 'REJECTED'
                AND oa."createdAt" >= op."updatedAt"
            )
        ` as any[]
        const pendingOrganizers = Number(pendingOrganizersResult[0]?.count || 0)

        const pendingComediansResult = await prisma.$queryRaw`
            SELECT COUNT(*) as count
            FROM "User" u
            JOIN "ComedianProfile" cp ON u.id = cp."userId"
            WHERE u.role = 'COMEDIAN_UNVERIFIED'
            AND NOT EXISTS (
                SELECT 1 FROM "ComedianApproval" ca 
                WHERE ca."comedianId" = cp.id 
                AND ca.status = 'REJECTED'
                AND ca."createdAt" >= cp."updatedAt"
            )
        ` as any[]
        const pendingComedians = Number(pendingComediansResult[0]?.count || 0)

        return {
            totalUsers,
            newUsersToday,
            activeShows,
            totalRevenue,
            pendingApprovals: pendingOrganizers + pendingComedians
        }
    }
}

// Export singleton instance
export const adminStatsService = new AdminStatsService()
