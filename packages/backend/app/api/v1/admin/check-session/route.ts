import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession, checkAdminPasswordSession } from '@/lib/admin-password'

export async function GET(request: NextRequest) {
  try {
    // Check if admin password session exists
    const hasValidPasswordSession = await checkAdminPasswordSession(request)
    
    if (hasValidPasswordSession) {
      return NextResponse.json({ authenticated: true })
    }
    
    // Check if admin needs to set up password
    const sessionCheck = await verifyAdminSession(request)
    if (sessionCheck.valid && sessionCheck.needsPassword) {
      return NextResponse.json({ needsPasswordSetup: true })
    }
    
    if (!sessionCheck.valid) {
      return NextResponse.json({ 
        error: sessionCheck.user?.role !== 'ADMIN' ? 'not_admin' : 'unauthorized' 
      })
    }
    
    return NextResponse.json({ authenticated: false })
    
  } catch (error) {
    console.error('Admin session check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
