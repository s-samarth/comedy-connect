import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NODE_ENV === "production",
    })

    const { pathname } = request.nextUrl

    // 1. Skip paths that don't need onboarding check
    const isOnboardingRoute = pathname.startsWith('/onboarding')
    const isExcludedRoute = pathname.startsWith('/api/') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/_next') ||
        pathname === '/favicon.ico'

    if (token && !isOnboardingRoute && !isExcludedRoute) {
        if (!(token as any).onboardingCompleted) {
            return NextResponse.redirect(new URL("/onboarding", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
}
