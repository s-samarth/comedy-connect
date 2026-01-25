import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession, hashAdminPassword } from '@/lib/admin-password'

export async function POST(request: NextRequest) {
  try {
    // Verify admin session first
    const sessionCheck = await verifyAdminSession(request)
    if (!sessionCheck.valid || !sessionCheck.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { currentPassword, newPassword, confirmPassword } = await request.json()
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }
    
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New passwords do not match' }, { status: 400 })
    }
    
    // Verify current password
    if (!sessionCheck.user.adminPasswordHash) {
      return NextResponse.json({ error: 'No current password set' }, { status: 400 })
    }
    
    const { verifyAdminPassword } = await import('@/lib/admin-password')
    const isValid = await verifyAdminPassword(currentPassword, sessionCheck.user.adminPasswordHash)
    
    if (!isValid) {
      return NextResponse.json({ error: 'Current password incorrect' }, { status: 401 })
    }
    
    // Hash and store new admin password
    const hashedNewPassword = await hashAdminPassword(newPassword)
    
    const { prisma } = await import('@/lib/prisma')
    await prisma.user.update({
      where: { email: sessionCheck.user.email },
      data: { adminPasswordHash: hashedNewPassword }
    })
    
    // Clear admin session to force re-authentication
    const response = NextResponse.json({ success: true })
    response.cookies.delete('admin-session')
    
    return response
    
  } catch (error) {
    console.error('Admin password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
