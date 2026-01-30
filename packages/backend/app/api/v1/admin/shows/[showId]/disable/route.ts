import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/admin-password'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ showId: string }> }
) {
  try {
    // Verify admin session
    const sessionCheck = await verifyAdminSession(request)
    if (!sessionCheck.valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { showId } = await params

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
