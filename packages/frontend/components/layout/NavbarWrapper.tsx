'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';

export function NavbarWrapper() {
    const pathname = usePathname();

    // Paths where Navbar should NOT match
    // We check if pathname starts with these segments
    const excludedPrefixes = [
        '/auth',
        '/onboarding',
        '/api',
        '/_next'
    ];

    const shouldHideNavbar = excludedPrefixes.some(prefix => pathname.startsWith(prefix));

    if (shouldHideNavbar) {
        return null;
    }

    return <Navbar />;
}
