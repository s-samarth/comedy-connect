/**
 * Mock Next.js router for testing
 */

import { useRouter as useNextRouter } from 'next/navigation';

export const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
};

export function createMockRouter(overrides = {}) {
    return {
        ...mockRouter,
        ...overrides,
    };
}

// Mock useRouter hook
vi.mock('next/navigation', () => ({
    useRouter: () => mockRouter,
    usePathname: () => mockRouter.pathname,
    useSearchParams: () => new URLSearchParams(),
}));

export { mockRouter as router };
