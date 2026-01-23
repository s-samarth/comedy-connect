/**
 * Authentication Mocks for Testing
 * 
 * Provides mock session and user objects for testing authenticated routes
 * without needing real OAuth sessions.
 */

import { UserRole } from '@prisma/client';

// Type definitions matching NextAuth session
export interface MockUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    image?: string | null;
}

export interface MockSession {
    user: MockUser;
    expires: string;
}

/**
 * Create a mock user for testing
 */
export function createMockUser(
    role: UserRole = UserRole.AUDIENCE,
    overrides: Partial<MockUser> = {}
): MockUser {
    const id = overrides.id || `mock-user-${role.toLowerCase()}`;
    return {
        id,
        email: overrides.email || `${id}@test.com`,
        name: overrides.name || `Test ${role} User`,
        role,
        image: overrides.image || null,
    };
}

/**
 * Create a mock session for a user
 */
export function createMockSession(user: MockUser): MockSession {
    return {
        user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    };
}

// Pre-built mock users for each role
export const MOCK_USERS = {
    audience: createMockUser(UserRole.AUDIENCE, {
        id: 'mock-audience',
        email: 'audience@test.com',
        name: 'Test Audience',
    }),
    organizerUnverified: createMockUser(UserRole.ORGANIZER_UNVERIFIED, {
        id: 'mock-organizer-unverified',
        email: 'organizer-unverified@test.com',
        name: 'Test Unverified Organizer',
    }),
    organizerVerified: createMockUser(UserRole.ORGANIZER_VERIFIED, {
        id: 'mock-organizer-verified',
        email: 'organizer-verified@test.com',
        name: 'Test Verified Organizer',
    }),
    comedianUnverified: createMockUser(UserRole.COMEDIAN_UNVERIFIED, {
        id: 'mock-comedian-unverified',
        email: 'comedian-unverified@test.com',
        name: 'Test Unverified Comedian',
    }),
    comedianVerified: createMockUser(UserRole.COMEDIAN_VERIFIED, {
        id: 'mock-comedian-verified',
        email: 'comedian-verified@test.com',
        name: 'Test Verified Comedian',
    }),
    admin: createMockUser(UserRole.ADMIN, {
        id: 'mock-admin',
        email: 'admin@test.com',
        name: 'Test Admin',
    }),
};

// Pre-built mock sessions
export const MOCK_SESSIONS = {
    audience: createMockSession(MOCK_USERS.audience),
    organizerUnverified: createMockSession(MOCK_USERS.organizerUnverified),
    organizerVerified: createMockSession(MOCK_USERS.organizerVerified),
    comedianUnverified: createMockSession(MOCK_USERS.comedianUnverified),
    comedianVerified: createMockSession(MOCK_USERS.comedianVerified),
    admin: createMockSession(MOCK_USERS.admin),
};

/**
 * Mock the getCurrentUser function from @/lib/auth
 * 
 * Usage in tests:
 * ```
 * jest.mock('@/lib/auth', () => ({
 *   getCurrentUser: jest.fn().mockResolvedValue(MOCK_USERS.admin),
 * }));
 * ```
 */
export function mockGetCurrentUser(user: MockUser | null) {
    return jest.fn().mockResolvedValue(user);
}

/**
 * Create authorization header for testing
 * Note: This is for documentation - real auth uses session cookies
 */
export function createAuthHeader(user: MockUser): Record<string, string> {
    // In a real implementation, this might create a JWT or session token
    // For our tests, we mock at the getCurrentUser level instead
    return {
        'X-Test-User-Id': user.id,
        'X-Test-User-Role': user.role,
    };
}
