'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        // Public routes that don't require onboarding
        const isPublicRoute =
            pathname.startsWith('/auth') ||
            pathname.startsWith('/api') ||
            pathname.startsWith('/_next') ||
            pathname.startsWith('/favicon.ico');

        const isOnboardingRoute = pathname.startsWith('/onboarding');

        if (isAuthenticated && !user?.onboardingCompleted && !isOnboardingRoute && !isPublicRoute) {
            router.push(`/onboarding?callbackUrl=${encodeURIComponent(pathname)}`);
        }
    }, [user, isAuthenticated, isLoading, pathname, router]);

    // Don't block rendering of public routes or while loading (unless we want a global loading state)
    // We render children but the effect will trigger redirect if needed.
    // For a stricter guard, we could return null/loader here while checking.
    // But to avoid flashing, rendering children is often okay for public routes.

    // However, if we are on a protected route and checking onboarding, we might want to wait.
    return <>{children}</>;
}
