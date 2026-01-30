import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession, verifyAdminPassword, createAdminSessionCookie } from '@/lib/admin-password'

export async function POST(request: NextRequest) {
  try {
    // Verify admin session first
    const sessionCheck = await verifyAdminSession(request)
    if (!sessionCheck.valid || !sessionCheck.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 })
    }

    // Verify admin password
    if (!sessionCheck.user.adminPasswordHash) {
      return NextResponse.json({ error: 'Admin password not set' }, { status: 400 })
    }

    const isValid = await verifyAdminPassword(password, sessionCheck.user.adminPasswordHash)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    // Create secure admin session cookie (2 hours)
    const sessionCookie = await createAdminSessionCookie(sessionCheck.user.email)

    const response = NextResponse.json({ success: true })
    response.cookies.set('admin-secure-session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 // 2 hours
    })

    return response

  } catch (error) {
    console.error('Admin password verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
