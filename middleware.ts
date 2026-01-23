import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { checkAdminPasswordSession } from "@/lib/admin-password"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Whitelist of admin emails - only you can access admin panel
const ADMIN_WHITELIST = [
  // Add your email here
  process.env.ADMIN_EMAIL || 'your-email@example.com'
]

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  })
  const { pathname } = request.nextUrl

  // Check if user needs onboarding (authenticated but hasn't completed onboarding)
  if (token && !pathname.startsWith('/onboarding') && !pathname.startsWith('/api') && !pathname.startsWith('/auth')) {
    try {
      // Fetch fresh user data to check onboarding status
      const response = await fetch(`${request.nextUrl.origin}/api/user/onboarding-status`, {
        headers: {
          'Cookie': request.headers.get('cookie') || '',
        },
      })

      if (response.ok) {
        const { needsOnboarding } = await response.json()
        if (needsOnboarding) {
          return NextResponse.redirect(new URL("/onboarding", request.url))
        }
      }
    } catch (error) {
      // If we can't check onboarding status, allow request to proceed
      console.error('Error checking onboarding status:', error)
    }
  }

  // Special handling for admin-hidden - allow access for password prompt
  if (pathname.startsWith("/admin-hidden")) {
    // Allow access to the main admin-hidden page for password setup/verification
    if (pathname === "/admin-hidden") {
      // Only check if user is authenticated (any role)
      if (!token) {
        return NextResponse.redirect(new URL("/auth/signin", request.url))
      }

      // Check email whitelist for security
      if (!token.email || !ADMIN_WHITELIST.includes(token.email as string)) {
        return NextResponse.redirect(new URL("/", request.url))
      }

      // Allow access - page component will handle password verification and role checking
      return NextResponse.next()
    }

    // For other admin-hidden subroutes, require full admin access
    if (!token || (token as any).role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Additional email whitelist check for extra security
    if (!token.email || !ADMIN_WHITELIST.includes(token.email as string)) {
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Require password verification for subroutes
    const hasValidPasswordSession = await checkAdminPasswordSession(request)
    if (!hasValidPasswordSession) {
      return NextResponse.redirect(new URL("/admin-hidden", request.url))
    }
  }

  // Protect admin routes (except the admin portal which handles its own password-based auth)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin-secure")) {
    console.log("🔍 Admin route accessed:", pathname)
    console.log("🔍 Token:", token ? {
      email: token.email,
      role: (token as any).role,
      id: (token as any).id
    } : "NO TOKEN")
    console.log("🔍 Admin whitelist:", ADMIN_WHITELIST)

    if (!token || (token as any).role !== "ADMIN") {
      console.log("❌ Access denied: No token or role is not ADMIN")
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Additional email whitelist check for extra security
    if (!token.email || !ADMIN_WHITELIST.includes(token.email as string)) {
      console.log("❌ Access denied: Email not in whitelist")
      return NextResponse.redirect(new URL("/", request.url))
    }

    console.log("✅ Admin access granted")
  }

  // Protect organizer routes - allow existing session to pass, 
  // page-level auth will verify fresh role from DB
  if (pathname.startsWith("/organizer")) {
    console.log("🎭 Organizer route accessed:", pathname)
    console.log("🎭 Token:", token ? {
      email: token.email,
      role: (token as any).role,
      id: (token as any).id
    } : "NO TOKEN")
    if (!token) {
      console.log("❌ Organizer access denied: No token")
      return NextResponse.redirect(new URL("/", request.url))
    }
    console.log("✅ Organizer token check passed")
  }

  // Protect comedian routes - allow existing session to pass,
  // page-level auth will verify fresh role from DB
  if (pathname.startsWith("/comedian")) {
    console.log("🎤 Comedian route accessed:", pathname)
    console.log("🎤 Token:", token ? {
      email: token.email,
      role: (token as any).role,
      id: (token as any).id
    } : "NO TOKEN")
    if (!token) {
      console.log("❌ Comedian access denied: No token")
      return NextResponse.redirect(new URL("/", request.url))
    }
    console.log("✅ Comedian token check passed")
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/admin-hidden/:path*", "/organizer/:path*", "/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
