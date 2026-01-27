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

// Generate a random 6-digit code
export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
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

// Email whitelist validation
export function isAdminEmailWhitelisted(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAIL?.split(',').map(e => e.trim()) || []
  console.log(`[AuthDebug] Checking whitelist for: ${email}`)
  console.log(`[AuthDebug] Configured ADMIN_EMAIL: ${process.env.ADMIN_EMAIL}`)
  console.log(`[AuthDebug] Parsed adminEmails: ${JSON.stringify(adminEmails)}`)
  const isWhitelisted = adminEmails.includes(email)
  console.log(`[AuthDebug] Is whitelisted: ${isWhitelisted}`)
  return isWhitelisted
}

// Create admin session cookie
export function createAdminSessionCookie(email: string): string {
  const session = {
    email,
    verified: true,
    expires: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
  }
  return JSON.stringify(session)
}

// Secure session signing using Web Crypto API (Edge compatible)
const SESSION_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev'

// Helper to convert string to ArrayBuffer
function str2ab(str: string) {
  return new TextEncoder().encode(str)
}

// Validate admin session from cookie
export async function validateAdminSession(cookieValue: string | undefined): Promise<{ valid: boolean; email?: string }> {
  if (!cookieValue) return { valid: false }

  const parts = cookieValue.split('.')
  // If it's not a signed cookie (old format or invalid), try legacy parse or fail
  if (parts.length !== 2) {
    console.log("[AuthDebug] Invalid cookie format (expected payload.signature)")
    return { valid: false }
  }

  const [payload, signature] = parts

  try {
    // Import Web Crypto API if running in Node environment where strictly global crypto might be an issue (though Next.js usually polyfills)
    // modifying to use global crypto which is standard in Next.js 15+

    const key = await crypto.subtle.importKey(
      'raw',
      str2ab(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // Convert hex signature back to Uint8Array
    const sigArray = new Uint8Array(signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))

    const isValidSignature = await crypto.subtle.verify(
      'HMAC',
      key,
      sigArray,
      str2ab(payload)
    )

    if (!isValidSignature) {
      console.error('[AdminSecurity] Invalid session signature detected!')
      return { valid: false }
    }

    const session = JSON.parse(atob(payload))
    console.log(`[AuthDebug] Validating session:`, JSON.stringify(session, null, 2))

    if (session.verified && session.expires > Date.now() && isAdminEmailWhitelisted(session.email)) {
      console.log(`[AuthDebug] Session valid`)
      return { valid: true, email: session.email }
    } else {
      console.log(`[AuthDebug] Session invalid logic checks failed`)
    }
  } catch (error) {
    console.error('[AdminSecurity] Session validation error:', error)
    return { valid: false }
  }

  return { valid: false }
}
