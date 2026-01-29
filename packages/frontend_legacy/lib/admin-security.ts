import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Enhanced security configurations
const SECURITY_CONFIG = {
  // Rate limiting for admin routes
  RATE_LIMIT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5, // Max 5 attempts per window
    blockDuration: 30 * 60 * 1000 // Block for 30 minutes
  },
  
  // IP-based restrictions (optional)
  ALLOWED_IPS: process.env.ADMIN_ALLOWED_IPS?.split(',') || [],
  
  // Session security
  MAX_SESSION_AGE: 2 * 60 * 60 * 1000, // 2 hours
  REQUIRE_REAUTH: true // Require re-authentication for sensitive actions
}

// In-memory rate limiting (for production, use Redis)
const rateLimitStore = new Map()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(ip)
  
  if (!record) {
    rateLimitStore.set(ip, { attempts: 1, firstAttempt: now })
    return false
  }
  
  if (now - record.firstAttempt > SECURITY_CONFIG.RATE_LIMIT.windowMs) {
    // Reset window
    rateLimitStore.set(ip, { attempts: 1, firstAttempt: now })
    return false
  }
  
  if (record.attempts >= SECURITY_CONFIG.RATE_LIMIT.maxAttempts) {
    return true
  }
  
  record.attempts++
  return false
}

export async function adminSecurityMiddleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const { pathname } = request.nextUrl
  const clientIP = (request.headers.get('x-forwarded-for')?.split(',')[0] || 
    request.headers.get('x-real-ip') || 
    'unknown') as string
  
  // Rate limiting
  if (isRateLimited(clientIP)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429 }
    )
  }
  
  // IP-based restrictions (if configured)
  if (SECURITY_CONFIG.ALLOWED_IPS.length > 0) {
    if (!SECURITY_CONFIG.ALLOWED_IPS.includes(clientIP)) {
      console.warn(`Unauthorized IP access attempt: ${clientIP}`)
      return NextResponse.redirect(new URL("/", request.url))
    }
  }
  
  // Token validation
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }
  
  // Session age check
  if (token.iat && (Date.now() - (token.iat as number) * 1000) > SECURITY_CONFIG.MAX_SESSION_AGE) {
    return NextResponse.redirect(new URL("/auth/signin", request.url))
  }
  
  return { token, clientIP }
}
