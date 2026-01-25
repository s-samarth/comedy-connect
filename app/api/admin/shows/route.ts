import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Verify admin session using unified check
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { prisma } = await import('@/lib/prisma')

    // 1. Fetch all shows with creator info via Raw SQL
    // We join User and OrganizerProfile to mimic the Prisma include relation
    // We strictly cast boolean fields to ensure they are returned correctly
    const shows = await prisma.$queryRaw`
      SELECT 
        s."id", 
        s."title", 
        s."description", 
        s."date", 
        s."venue", 
        s."ticketPrice", 
        s."totalTickets", 
        s."posterImageUrl", 
        s."createdAt", 
        s."isPublished", 
        s."isDisbursed", 
        s."customPlatformFee",
        u."email" as "creatorEmail",
        op."name" as "creatorName"
      FROM "Show" s
      LEFT JOIN "User" u ON s."createdBy" = u."id"
      LEFT JOIN "OrganizerProfile" op ON u."id" = op."userId"
      ORDER BY s."createdAt" DESC
    ` as any[]

    // 2. Fetch booking stats via Raw SQL
    const bookingStats = await prisma.$queryRaw`
      SELECT 
        "showId", 
        SUM("totalAmount") as "revenue", 
        SUM("quantity") as "ticketsSold"
      FROM "Booking"
      WHERE "status" IN ('CONFIRMED', 'CONFIRMED_UNPAID')
      GROUP BY "showId"
    ` as any[]

    const statsMap = new Map()
    bookingStats.forEach((s: any) => {
      statsMap.set(s.showId, {
        revenue: Number(s.revenue || 0),
        ticketsSold: Number(s.ticketsSold || 0)
      })
    })

    // 3. Map to the structure expected by the frontend
    const mappedShows = shows.map(s => {
      // Reconstitute the nested creator object
      const creator = {
        email: s.creatorEmail || "",
        organizerProfile: s.creatorName ? { name: s.creatorName } : null
      }

      const stats = statsMap.get(s.id) || { revenue: 0, ticketsSold: 0 }

      return {
        id: s.id,
        title: s.title,
        description: s.description,
        date: s.date, // Prisma raw returns Date objects for timestamps usually
        venue: s.venue,
        ticketPrice: s.ticketPrice,
        totalTickets: s.totalTickets,
        posterImageUrl: s.posterImageUrl,
        createdAt: s.createdAt,
        isPublished: Boolean(s.isPublished), // Ensure boolean
        isDisbursed: Boolean(s.isDisbursed), // Ensure boolean
        customPlatformFee: s.customPlatformFee,
        creator,
        _count: {
          bookings: stats.ticketsSold // Frontend uses this or stats.ticketsSold
        },
        stats
      }
    })

    // Helper to safe-stringify BigInt if any slip through
    const safeJson = (data: any) => {
      return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
    }

    return NextResponse.json({ shows: safeJson(mappedShows) })

  } catch (error) {
    console.error('Admin shows fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin session using unified check
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { showId, action, customPlatformFee, isDisbursed } = body

    if (!showId || !action) {
      return NextResponse.json({ error: 'Missing showId or action' }, { status: 400 })
    }

    const { prisma } = await import('@/lib/prisma')

    if (action === 'UPDATE_FEE') {
      if (customPlatformFee !== null && (typeof customPlatformFee !== 'number' || customPlatformFee < 0 || customPlatformFee > 100)) {
        return NextResponse.json({ error: 'Invalid fee percentage (0-100 required)' }, { status: 400 })
      }

      const res = await prisma.$executeRaw`
          UPDATE "Show" 
          SET "customPlatformFee" = ${customPlatformFee} 
          WHERE "id" = ${showId}
      `
      console.log(`UPDATE_SHOW_FEE: Rows=${res}, ID=${showId}, Fee=${customPlatformFee}`)

      return NextResponse.json({ success: true, message: 'Platform fee updated' })
    }

    // Implement publish/unpublish/delete logic
    if (action === 'PUBLISH' || action === 'UNPUBLISH') {
      const isPublished = action === 'PUBLISH'

      await prisma.show.update({
        where: { id: showId },
        data: { isPublished }
      })

      return NextResponse.json({
        success: true,
        message: `Show ${isPublished ? 'published' : 'unpublished'} successfully`
      })
    }

    if (action === 'DELETE') {
      await prisma.$transaction(async (tx) => {
        // Delete related bookings manually as strict FK constraints might prevent cascade
        await tx.booking.deleteMany({
          where: { showId: showId }
        })

        // Delete the show (TicketInventory and ShowComedian have cascade delete in schema)
        await tx.show.delete({
          where: { id: showId }
        })
      })

      return NextResponse.json({
        success: true,
        message: 'Show deleted successfully'
      })
    }

    if (action === 'SET_DISBURSED') {
      await prisma.show.update({
        where: { id: showId },
        data: { isDisbursed: Boolean(isDisbursed) }
      })

      return NextResponse.json({
        success: true,
        message: `Show marked as ${isDisbursed ? 'disbursed' : 'to be disbursed'}`
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Admin show action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
