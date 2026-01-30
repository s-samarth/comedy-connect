import { NextResponse } from 'next/server'
import { adminAuthService } from '@/services/admin/admin-auth.service'
import { getCurrentUser } from '@/lib/auth'
import { mapErrorToResponse, UnauthorizedError } from '@/errors'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role !== 'ADMIN') {
      throw new UnauthorizedError('Admin access required')
    }

    const { email, password } = await request.json()

    // Delegate to service
    const result = await adminAuthService.resetPassword(email, password)

    return NextResponse.json(result)
  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}
