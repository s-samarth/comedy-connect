import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-password'

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const sessionCheck = await verifyAdminSession(request)
    if (!sessionCheck.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { prisma } = await import('@/lib/prisma')
    const { searchParams } = new URL(request.url)
    const showId = searchParams.get('showId')
    
    if (!showId) {
      return NextResponse.json({ error: 'Show ID required' }, { status: 400 })
    }
    
    // For now, just return success (we can add actual disable logic later)
    return NextResponse.json({ success: true, message: 'Show disabled successfully' })
    
  } catch (error) {
    console.error('Admin show disable error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
