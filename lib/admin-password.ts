import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

// Admin password utilities
export async function hashAdminPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyAdminPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

// Check if admin has set up password
export async function checkAdminPasswordExists(userEmail: string): Promise<boolean> {
  const { prisma } = await import('@/lib/prisma')
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { adminPasswordHash: true }
  })
  return !!user?.adminPasswordHash
}

// Verify admin session + password
export async function verifyAdminSession(request: NextRequest): Promise<{ valid: boolean; user?: any; needsPassword?: boolean }> {
  const { getToken } = await import('next-auth/jwt')
  const { prisma } = await import('@/lib/prisma')
  
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  if (!token || !token.email) {
    return { valid: false }
  }
  
  // Check email whitelist
  const adminEmails = [process.env.ADMIN_EMAIL].filter(Boolean)
  if (!adminEmails.includes(token.email as string)) {
    return { valid: false }
  }
  
  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: token.email as string },
    select: { id: true, email: true, role: true, adminPasswordHash: true }
  })
  
  if (!user || user.role !== 'ADMIN') {
    return { valid: false }
  }
  
  // Check if admin password is set
  if (!user.adminPasswordHash) {
    return { valid: true, user, needsPassword: true }
  }
  
  return { valid: true, user, needsPassword: false }
}

// Check session password verification
export async function checkAdminPasswordSession(request: NextRequest): Promise<boolean> {
  const sessionData = request.cookies.get('admin-session')?.value
  if (!sessionData) return false
  
  try {
    const session = JSON.parse(sessionData)
    const { getToken } = await import('next-auth/jwt')
    
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    return session.email === token?.email && 
           session.verified === true && 
           session.expires > Date.now()
  } catch {
    return false
  }
}
