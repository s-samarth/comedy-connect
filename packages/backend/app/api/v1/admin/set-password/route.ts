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

    // Set secure session cookie
    const response = NextResponse.json({ success: true })

    if (result.sessionCookie) {
      response.cookies.set('admin-secure-session', result.sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 2 * 60 * 60 // 2 hours
      })
    }

    return response
  } catch (error) {
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
  }
}
