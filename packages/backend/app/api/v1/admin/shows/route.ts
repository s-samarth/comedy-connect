import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { adminService } from "@/services/admin/admin.service"
import { mapErrorToResponse } from "@/errors"

export async function GET(request: NextRequest) {
  try {
    // Verify admin session using unified check
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const shows = await adminService.getShowsWithStats()

    // Helper to safe-stringify BigInt if any slip through
    const safeJson = (data: any) => {
      return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ))
    }

    return NextResponse.json({ shows: safeJson(shows) })

  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
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

    if (action === 'UPDATE_FEE') {
      await adminService.updateShowFee(showId, customPlatformFee)
      return NextResponse.json({ success: true, message: 'Platform fee updated' })
    }

    if (action === 'PUBLISH' || action === 'UNPUBLISH') {
      const isPublished = action === 'PUBLISH'
      await adminService.togglePublish(showId, isPublished)
      return NextResponse.json({
        success: true,
        message: `Show ${isPublished ? 'published' : 'unpublished'} successfully`
      })
    }

    if (action === 'DELETE') {
      await adminService.deleteShow(showId)
      return NextResponse.json({
        success: true,
        message: 'Show deleted successfully'
      })
    }

    if (action === 'SET_DISBURSED') {
      await adminService.setDisbursed(showId, Boolean(isDisbursed))
      return NextResponse.json({
        success: true,
        message: `Show marked as ${isDisbursed ? 'disbursed' : 'to be disbursed'}`
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}
