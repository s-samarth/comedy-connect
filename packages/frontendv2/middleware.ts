import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request as any,
        secret: process.env.NEXTAUTH_SECRET,
        // In local dev with different ports, we don't use secureCookie.
        // But NextAuth automatically handles this based on NEXTAUTH_URL or cookie names.
        secureCookie: process.env.NODE_ENV === "production",
    })

    const { pathname } = request.nextUrl

    // 1. Skip paths that don't need onboarding check
    const isOnboardingRoute = pathname.startsWith('/onboarding')
    const isExcludedRoute = pathname.startsWith('/api/') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/_next') ||
        pathname === '/favicon.ico'

    // If authenticated but not onboarded, redirect to /onboarding
    if (token && !isOnboardingRoute && !isExcludedRoute) {
        if (!(token as any).onboardingCompleted) {
            const onboardingUrl = new URL("/onboarding", request.url)
            onboardingUrl.searchParams.set("callbackUrl", pathname)
            return NextResponse.redirect(onboardingUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder assets (e.g. .png, .jpg)
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
    ],
}
