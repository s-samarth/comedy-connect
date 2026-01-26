import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { checkAdminPasswordSession, validateAdminSession } from "@/lib/admin-password"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Whitelist of admin emails - only you can access admin panel
const ADMIN_WHITELIST = [
  // Add your email here
  process.env.ADMIN_EMAIL || 'your-email@example.com'
]

export async function middleware(request: NextRequest) {
  // CORS Handling
  const origin = request.headers.get('origin')
  const isAllowedOrigin = origin === 'http://localhost:3000' || !origin

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const response = NextResponse.next()

  // Add CORS headers to all responses
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  })
  const { pathname } = request.nextUrl

  // Helper for 401/403 responses instead of redirects for API routes
  const errorResponse = (status: number, message: string) => {
    const res = NextResponse.json({ error: message }, { status })
    if (isAllowedOrigin) {
      res.headers.set('Access-Control-Allow-Origin', origin || '*')
      res.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    return res
  }

  // Check if user needs onboarding (authenticated but hasn't completed onboarding)
  // Disable redirection for API routes
  if (token && !pathname.startsWith('/onboarding') && !pathname.startsWith('/api') && !pathname.startsWith('/auth')) {
    // ... (existing onboarding check logic if needed for port 4000's own UI, but port 4000 is mostly API)
  }

  // Check for admin-secure-session cookie
  const adminCookie = request.cookies.get('admin-secure-session')?.value
  const adminSession = await validateAdminSession(adminCookie)

  // Protect admin routes (including API routes)
  if (pathname.startsWith("/api/v1/admin") || (pathname.startsWith("/admin") && !pathname.startsWith("/admin-secure"))) {
    const isNextAuthAdmin = token && (token as any).role === "ADMIN" && token.email && ADMIN_WHITELIST.includes(token.email as string)
    const isAdminCookieValid = adminSession.valid && adminSession.email && ADMIN_WHITELIST.includes(adminSession.email)

    if (!isNextAuthAdmin && !isAdminCookieValid) {
      return pathname.startsWith('/api') ? errorResponse(403, 'Unauthorized') : NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Admin Secure portal logic
  if (pathname.startsWith("/api/admin-secure") || pathname.startsWith("/admin-secure")) {
    // Admin-secure handles its own session cookies, let it pass or check session
    // For now, let the route handler manage it
    return response
  }

  // Protect organizer routes
  if (pathname.startsWith("/api/v1/organizer") || pathname.startsWith("/organizer")) {
    if (!token) {
      return pathname.startsWith('/api') ? errorResponse(401, 'Unauthenticated') : NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Protect comedian routes
  if (pathname.startsWith("/api/v1/comedian") || pathname.startsWith("/comedian")) {
    if (!token) {
      return pathname.startsWith('/api') ? errorResponse(401, 'Unauthenticated') : NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin-hidden/:path*",
    "/organizer/:path*",
    "/comedian/:path*",
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

