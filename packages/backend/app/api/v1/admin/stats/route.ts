
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
    try {
        const user = await getCurrentUser()

        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        const allCookies = cookieStore.getAll()
        const adminCookie = cookieStore.get('admin-secure-session')

        console.log("DEBUG_STATS_COOKIES:", allCookies.map(c => c.name))
        console.log("DEBUG_STATS_ADMIN_COOKIE:", adminCookie ? "PRESENT" : "MISSING", adminCookie?.value)

        console.log("DEBUG_STATS_USER:", JSON.stringify(user, null, 2))

        if (!user || user.role !== 'ADMIN') {
            console.log("DEBUG_STATS_AUTH_FAILED: User is null or role mismatch", user?.role)
            return NextResponse.json({ error: 'Unauthorized', debug_user: user }, { status: 403 })
        }

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

        // 4. Total Revenue (Sum of all CONFIRMED or CONFIRMED_UNPAID bookings)
        // Note: Adjust status filter based on your business logic. 
        // Assuming CONFIRMED represents valid revenue.
        // 4. Total Revenue (Sum of all CONFIRMED or CONFIRMED_UNPAID bookings)
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
        const pendingOrganizers = await prisma.organizerApproval.count({
            where: { status: "PENDING" }
        })
        const pendingComedians = await prisma.comedianApproval.count({
            where: { status: "PENDING" }
        })

        return NextResponse.json({
            metrics: {
                totalUsers,
                newUsersToday,
                activeShows,
                totalRevenue,
                pendingApprovals: pendingOrganizers + pendingComedians
            }
        })

    } catch (error) {
        console.error("Error fetching admin stats:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
