import { prisma } from '../utils/prisma';
import type { User, Role } from '@prisma/client';

/**
 * Pre-defined test users for consistent testing
 */

export const TEST_USERS = {
    ADMIN: {
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'ADMIN' as Role,
        onboardingCompleted: true,
    },
    VERIFIED_ORGANIZER: {
        email: 'organizer@test.com',
        name: 'Test Organizer',
        role: 'ORGANIZER_VERIFIED' as Role,
        onboardingCompleted: true,
        city: 'Hyderabad',
    },
    UNVERIFIED_ORGANIZER: {
        email: 'organizer-unverified@test.com',
        name: 'Pending Organizer',
        role: 'ORGANIZER_UNVERIFIED' as Role,
        onboardingCompleted: true,
    },
    VERIFIED_COMEDIAN: {
        email: 'comedian@test.com',
        name: 'Test Comedian',
        role: 'COMEDIAN_VERIFIED' as Role,
        onboardingCompleted: true,
        city: 'Mumbai',
    },
    UNVERIFIED_COMEDIAN: {
        email: 'comedian-unverified@test.com',
        name: 'Pending Comedian',
        role: 'COMEDIAN_UNVERIFIED' as Role,
        onboardingCompleted: true,
    },
    AUDIENCE: {
        email: 'audience@test.com',
        name: 'Test User',
        role: 'AUDIENCE' as Role,
        onboardingCompleted: true,
        city: 'Delhi',
    },
};

/**
 * Create a test user with optional overrides
 */
export async function createTestUser(overrides: Partial<User> = {}): Promise<User> {
    return await prisma.user.create({
        data: {
            email: `test-${Date.now()}@example.com`,
            name: 'Test User',
            role: 'AUDIENCE',
            onboardingCompleted: false,
            ...overrides,
        },
    });
}

/**
 * Create multiple test users
 */
export async function createTestUsers(count: number, overrides: Partial<User> = {}): Promise<User[]> {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
        const user = await createTestUser({
            email: `test-user-${i}-${Date.now()}@example.com`,
            ...overrides,
        });
        users.push(user);
    }
    return users;
}

/**
 * Get or create a test user based on fixture
 */
export async function getOrCreateFixtureUser(fixtureName: keyof typeof TEST_USERS): Promise<User> {
    const fixture = TEST_USERS[fixtureName];

    let user = await prisma.user.findUnique({
        where: { email: fixture.email },
    });

    if (!user) {
        user = await prisma.user.create({
            data: fixture,
        });
    }

    return user;
}
