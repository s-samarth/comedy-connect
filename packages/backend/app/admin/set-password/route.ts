import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession, hashAdminPassword } from '@/lib/admin-password'

export async function POST(request: NextRequest) {
  try {
    // Verify admin session first
    const sessionCheck = await verifyAdminSession(request)
    if (!sessionCheck.valid || !sessionCheck.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { password, confirmPassword } = await request.json()
    
    if (!password || !confirmPassword) {
      return NextResponse.json({ error: 'Both passwords required' }, { status: 400 })
    }
    
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    
    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 })
    }
    
    // Hash and store admin password
    const hashedPassword = await hashAdminPassword(password)
    
    const { prisma } = await import('@/lib/prisma')
    await prisma.user.update({
      where: { email: sessionCheck.user.email },
      data: { adminPasswordHash: hashedPassword }
    })
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Admin password setting error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
