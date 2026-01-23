/**
 * Test Database Utilities
 * 
 * Provides isolated database operations for testing.
 * Uses transactions for test isolation when possible.
 */

import { PrismaClient, UserRole, BookingStatus, ApprovalStatus } from '@prisma/client';

// Create a dedicated Prisma client for tests
let testPrisma: PrismaClient | null = null;

export function getTestPrisma(): PrismaClient {
    if (!testPrisma) {
        testPrisma = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
                },
            },
            log: process.env.DEBUG ? ['query', 'error', 'warn'] : ['error'],
        });
    }
    return testPrisma;
}

/**
 * Clean up test data from the database
 * DANGER: This removes data - only use in test environment
 */
export async function cleanupTestData(): Promise<void> {
    const prisma = getTestPrisma();

    try {
        // First get all test show IDs to also clean related bookings
        const testShows = await prisma.show.findMany({
            where: { id: { startsWith: 'test-' } },
            select: { id: true },
        });
        const testShowIds = testShows.map(s => s.id);

        // Delete bookings first (both test-prefixed and those referencing test shows)
        if (testShowIds.length > 0) {
            await prisma.booking.deleteMany({
                where: {
                    OR: [
                        { id: { startsWith: 'test-' } },
                        { showId: { in: testShowIds } },
                    ],
                },
            });
        } else {
            await prisma.booking.deleteMany({
                where: { id: { startsWith: 'test-' } },
            });
        }

        // Now delete in order respecting remaining foreign key constraints
        await prisma.ticketInventory.deleteMany({
            where: { id: { startsWith: 'test-' } },
        });
        await prisma.showComedian.deleteMany({
            where: { id: { startsWith: 'test-' } },
        });
        await prisma.show.deleteMany({
            where: { id: { startsWith: 'test-' } },
        });
        await prisma.comedian.deleteMany({
            where: { id: { startsWith: 'test-' } },
        });
        await prisma.comedianApproval.deleteMany({
            where: { id: { startsWith: 'test-' } },
        });
        await prisma.comedianProfile.deleteMany({
            where: { id: { startsWith: 'test-' } },
        });
        await prisma.organizerApproval.deleteMany({
            where: { id: { startsWith: 'test-' } },
        });
        await prisma.organizerProfile.deleteMany({
            where: { id: { startsWith: 'test-' } },
        });
        await prisma.session.deleteMany({
            where: { id: { startsWith: 'test-' } },
        });
        await prisma.account.deleteMany({
            where: { id: { startsWith: 'test-' } },
        });
        await prisma.user.deleteMany({
            where: { id: { startsWith: 'test-' } },
        });
    } catch (error) {
        // Silently handle cleanup errors - they shouldn't fail tests
        console.error('Cleanup error (non-fatal):', error);
    }
}

/**
 * Create a test user with specified role
 */
export async function createTestUser(
    role: UserRole = UserRole.AUDIENCE,
    overrides: Partial<{
        id: string;
        email: string;
        name: string;
    }> = {}
): Promise<{ id: string; email: string; name: string | null; role: UserRole }> {
    const prisma = getTestPrisma();
    const id = overrides.id || `test-user-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const user = await prisma.user.create({
        data: {
            id,
            email: overrides.email || `${id}@test.com`,
            name: overrides.name || `Test User ${id}`,
            role,
            onboardingCompleted: true,
        },
    });

    return user;
}

/**
 * Create a test show with inventory
 */
export async function createTestShow(
    creatorId: string,
    overrides: Partial<{
        id: string;
        title: string;
        venue: string;
        ticketPrice: number;
        totalTickets: number;
        date: Date;
        isPublished: boolean;
    }> = {}
): Promise<{ id: string; title: string; venue: string; ticketPrice: number }> {
    const prisma = getTestPrisma();
    const id = overrides.id || `test-show-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const show = await prisma.show.create({
        data: {
            id,
            title: overrides.title || `Test Show ${id}`,
            venue: overrides.venue || 'Test Venue, Hyderabad',
            ticketPrice: overrides.ticketPrice ?? 500,
            totalTickets: overrides.totalTickets ?? 100,
            date: overrides.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            isPublished: overrides.isPublished ?? true,
            createdBy: creatorId,
            ticketInventory: {
                create: {
                    id: `test-inv-${id}`,
                    available: overrides.totalTickets ?? 100,
                },
            },
        },
    });

    return show;
}

/**
 * Create a test comedian
 */
export async function createTestComedian(
    creatorId: string,
    overrides: Partial<{
        id: string;
        name: string;
        bio: string;
    }> = {}
): Promise<{ id: string; name: string }> {
    const prisma = getTestPrisma();
    const id = overrides.id || `test-comedian-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const comedian = await prisma.comedian.create({
        data: {
            id,
            name: overrides.name || `Test Comedian ${id}`,
            bio: overrides.bio || 'Test bio',
            createdBy: creatorId,
        },
    });

    return comedian;
}

/**
 * Create an organizer profile for a user
 */
export async function createOrganizerProfile(
    userId: string,
    overrides: Partial<{
        id: string;
        name: string;
        venue: string;
    }> = {}
): Promise<{ id: string; userId: string; name: string }> {
    const prisma = getTestPrisma();
    const id = overrides.id || `test-org-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const profile = await prisma.organizerProfile.create({
        data: {
            id,
            userId,
            name: overrides.name || `Test Organizer ${id}`,
            venue: overrides.venue || 'Test Venue',
        },
    });

    return profile;
}

/**
 * Disconnect test database client
 */
export async function disconnectTestDb(): Promise<void> {
    if (testPrisma) {
        await testPrisma.$disconnect();
        testPrisma = null;
    }
}

// Export enums for convenience
export { UserRole, BookingStatus, ApprovalStatus };
