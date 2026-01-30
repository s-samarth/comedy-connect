import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Paths that should be excluded from onboarding checks
 */
const EXCLUDED_PATH_PREFIXES = [
    '/api/',
    '/auth',
    '/_next',
] as const;

const EXCLUDED_FILES = [
    '/comedy-connect-icon.ico',
] as const;

/**
 * Extended JWT token type with onboarding status
 */
interface ExtendedJWT {
    onboardingCompleted?: boolean;
    [key: string]: any;
}

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request as any,
        secret: process.env.NEXTAUTH_SECRET,
        // In local dev with different ports, we don't use secureCookie.
        // But NextAuth automatically handles this based on NEXTAUTH_URL or cookie names.
        secureCookie: process.env.NODE_ENV === "production",
    }) as ExtendedJWT | null;

    const { pathname } = request.nextUrl

    // 1. Skip paths that don't need onboarding check
    const isOnboardingRoute = pathname.startsWith('/onboarding');
    const isExcludedRoute = EXCLUDED_PATH_PREFIXES.some(prefix => pathname.startsWith(prefix)) ||
        EXCLUDED_FILES.some(file => pathname === file);

    // If authenticated but not onboarded, redirect to /onboarding
    if (token && !isOnboardingRoute && !isExcludedRoute) {
        if (!token.onboardingCompleted) {
            const onboardingUrl = new URL("/onboarding", request.url)
            onboardingUrl.searchParams.set("callbackUrl", pathname)
            return NextResponse.redirect(onboardingUrl)
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|comedy-connect-icon.ico|.*\\..*).*)",
    ],
}
