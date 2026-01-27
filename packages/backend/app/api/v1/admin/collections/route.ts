import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }
        const { searchParams } = new URL(request.url)
        const showId = searchParams.get('showId')

        const now = new Date()

        // 1. Fetch shows
        let shows: any[] = []
        if (showId) {
            // Fetch single show using Raw SQL for safety
            shows = await prisma.$queryRaw`
                SELECT s.*, 
                       u.email as "creatorEmail",
                       COALESCE(op.name, cp."stageName", u.name) as "creatorName"
                FROM "Show" s
                JOIN "User" u ON s."createdBy" = u.id
                LEFT JOIN "OrganizerProfile" op ON u.id = op."userId"
                LEFT JOIN "ComedianProfile" cp ON u.id = cp."userId"
                WHERE s.id = ${showId}
            ` as any[]

            // Map to match the expected structure
            shows = shows.map(s => ({
                ...s,
                creator: {
                    email: s.creatorEmail,
                    organizerProfile: s.creatorName ? { name: s.creatorName } : null
                },
                _count: { bookings: 0 } // Placeholder, will be updated below
            }))
        } else {
            // Fetch all shows that have bookings or are published
            shows = await prisma.show.findMany({
                include: {
                    _count: {
                        select: {
                            bookings: {
                                where: { status: { in: ['CONFIRMED', 'CONFIRMED_UNPAID'] } }
                            }
                        }
                    },
                    creator: {
                        select: {
                            email: true,
                            name: true,
                            organizerProfile: {
                                select: { name: true }
                            },
                            comedianProfile: {
                                select: { stageName: true }
                            }
                        }
                    }
                }
            })
        }

        // 2. Fetch bookings (Use Raw SQL to bypass stale Prisma Client schema validation)
        const bookingsList = await prisma.$queryRaw`
            SELECT "showId", "totalAmount", "platformFee", "bookingFee", "quantity"
            FROM "Booking"
            WHERE "status" IN ('CONFIRMED', 'CONFIRMED_UNPAID')
            AND (${showId}::text IS NULL OR "showId" = ${showId})
        ` as any[]

        const showStats = new Map()
        bookingsList.forEach((b: any) => {
            const prev = showStats.get(b.showId) || { showRevenue: 0, platformFee: 0, bookingFee: 0, ticketsSold: 0 }
            showStats.set(b.showId, {
                showRevenue: prev.showRevenue + (b.totalAmount || 0),
                platformFee: prev.platformFee + (b.platformFee || 0),
                bookingFee: prev.bookingFee + (b.bookingFee || 0),
                ticketsSold: prev.ticketsSold + (b.quantity || 0)
            })
        })

        // Patch shows with customPlatformFee via Raw SQL
        const showFees = await prisma.$queryRaw`
            SELECT "id", "customPlatformFee" FROM "Show"
        ` as any[]
        const feeMap = new Map(showFees.map(f => [f.id, f.customPlatformFee]))

        // 3. Enrich shows
        const enriched = shows.map(s => {
            const stats = showStats.get(s.id) || { showRevenue: 0, platformFee: 0, bookingFee: 0, ticketsSold: 0 }

            let finalPlatformFee = stats.platformFee
            // Get the current fee setting (from raw map or prisma fallback)
            const customFee = feeMap.get(s.id)

            // If the show is NOT disbursed, we recalculate the platform fee dynamically 
            // based on the CURRENT percentage setting. This allows admins to update commissions
            // for active shows and have it apply to all revenue immediately.
            if (!(s as any).isDisbursed) {
                const feePercent = typeof customFee === 'number' ? customFee : 8
                finalPlatformFee = stats.showRevenue * (feePercent / 100)
            }

            return {
                id: s.id,
                title: s.title,
                date: s.date,
                venue: s.venue,
                isDisbursed: (s as any).isDisbursed,
                isPublished: (s as any).isPublished,
                creator: s.creator,
                stats: {
                    ...stats,
                    platformFee: finalPlatformFee,
                    platformRevenue: stats.showRevenue + stats.bookingFee, // User defined: Total Intake (GTV)
                    platformEarnings: finalPlatformFee + stats.bookingFee, // User defined: Net Earnings
                    showEarnings: stats.showRevenue - finalPlatformFee,
                    ticketsSold: stats.ticketsSold
                }
            }
        }).filter(s => showId ? true : (s.stats.showRevenue > 0 || s.stats.ticketsSold > 0))

        const baseObj = () => ({
            showRevenue: 0,
            platformFee: 0,
            bookingFee: 0,
            platformRevenue: 0,
            platformEarnings: 0,
            showEarnings: 0,
            shows: [] as any[]
        })

        const result: any = {
            lifetime: baseObj(),
            active: baseObj(),
            pending: baseObj(),
            booked: baseObj(),
            unpublished: baseObj()
        }

        result.lifetime.shows = enriched
        // Active: Future date, not disbursed, AND Published
        result.active.shows = enriched.filter(s => new Date(s.date) >= now && !s.isDisbursed && (s as any).isPublished)
        // Pending: Past date, not disbursed, AND Published
        result.pending.shows = enriched.filter(s => new Date(s.date) < now && !s.isDisbursed && (s as any).isPublished)
        // Booked: Disbursed (Archives)
        result.booked.shows = enriched.filter(s => s.isDisbursed)

        // Unpublished: Any show with revenue that is NOT published and NOT disbursed
        // This catches drafts, revoked shows, etc. that have associated money.
        result.unpublished.shows = enriched.filter(s => !(s as any).isPublished && !s.isDisbursed)

        Object.keys(result).forEach(k => {
            const cat = result[k]
            cat.showRevenue = cat.shows.reduce((acc: number, s: any) => acc + (s.stats?.showRevenue || 0), 0)
            cat.platformFee = cat.shows.reduce((acc: number, s: any) => acc + (s.stats?.platformFee || 0), 0)
            cat.bookingFee = cat.shows.reduce((acc: number, s: any) => acc + (s.stats?.bookingFee || 0), 0)
            cat.platformRevenue = cat.shows.reduce((acc: number, s: any) => acc + (s.stats?.platformRevenue || 0), 0)
            cat.platformEarnings = cat.shows.reduce((acc: number, s: any) => acc + (s.stats?.platformEarnings || 0), 0)
            cat.showEarnings = cat.shows.reduce((acc: number, s: any) => acc + (s.stats?.showEarnings || 0), 0)
        })

        return NextResponse.json(result)
    } catch (err) {
        console.error("ADMIN_COLLECTIONS_ERROR:", err)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }
        const { showId, action } = await request.json()
        if (action === 'DISBURSE') {
            await prisma.show.update({ where: { id: showId }, data: { isDisbursed: true } as any })
            return NextResponse.json({ success: true })
        }
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (e) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
