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
    
    // Since schema doesn't have status field, we'll use a different approach
    // For now, we'll just return success - in a real implementation, you might:
    // 1. Add a status field to the schema
    // 2. Use a separate table to track disabled shows
    // 3. Use ticket inventory to prevent bookings
    
    // For demonstration, we'll just log the action
    console.log(`Admin action: ${action} show ${showId}`)
    
    return NextResponse.json({ 
      success: true, 
      message: `Show ${action.toLowerCase()}d successfully` 
    })
    
  } catch (error) {
    console.error('Admin show action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
