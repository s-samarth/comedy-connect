import { NextResponse } from 'next/server'
import { adminFeesService } from '@/services/admin/admin-fees.service'
import { getCurrentUser } from '@/lib/auth'
import { mapErrorToResponse, UnauthorizedError } from '@/errors'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedError('Admin access required')
    }

    // Delegate to service
    const result = await adminFeesService.getPlatformConfig()

    return NextResponse.json({ feeConfig: result.config })
  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedError('Admin access required')
    }

    const body = await request.json()
    // Handle both 'slabs' (from frontend) and 'feeSlabs' (internal/potential other clients)
    const slabsToUpdate = body.slabs || body.feeSlabs

    if (!slabsToUpdate) {
      throw new Error('Missing slabs or feeSlabs in request body')
    }

    // Delegate to service
    const result = await adminFeesService.updateFeeSlabs(slabsToUpdate)

    // Wrap in feeConfig for frontend compatibility
    return NextResponse.json({ feeConfig: result.config })
  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PUT(request: Request) {
  return POST(request)
}
