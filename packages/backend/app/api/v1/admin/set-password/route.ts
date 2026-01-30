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

    const { password, confirmPassword } = await request.json()

    // Delegate to service
    const result = await adminAuthService.setPassword(user.email, password, confirmPassword)

    return NextResponse.json(result)
  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}
