import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-password'

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const sessionCheck = await verifyAdminSession(request)
    if (!sessionCheck.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prisma } = await import('@/lib/prisma')

    const shows = await prisma.show.findMany({
      include: {
        creator: {
          select: {
            email: true,
            organizerProfile: {
              select: {
                name: true
              }
            }
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ shows })

  } catch (error) {
    console.error('Admin shows fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const sessionCheck = await verifyAdminSession(request)
    if (!sessionCheck.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { showId, action } = await request.json()

    if (!showId || !action) {
      return NextResponse.json({ error: 'Missing showId or action' }, { status: 400 })
    }

    const { prisma } = await import('@/lib/prisma')

    // Implement publish/unpublish logic
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

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Admin show action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
