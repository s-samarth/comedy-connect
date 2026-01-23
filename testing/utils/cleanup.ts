/**
 * Test Cleanup Utilities
 * 
 * Provides functions to clean up test data after tests complete.
 */

import { cleanupTestData, disconnectTestDb, getTestPrisma } from '../config/test-db';

/**
 * Full cleanup - removes all test data and disconnects
 */
export async function fullCleanup(): Promise<void> {
    try {
        await cleanupTestData();
    } catch (error) {
        console.error('Error during test data cleanup:', error);
    } finally {
        await disconnectTestDb();
    }
}

/**
 * Quick cleanup for between tests
 * Only removes specific types of data
 */
export async function quickCleanup(types: ('bookings' | 'shows' | 'users')[]): Promise<void> {
    const prisma = getTestPrisma();

    for (const type of types) {
        switch (type) {
            case 'bookings':
                await prisma.booking.deleteMany({
                    where: { id: { startsWith: 'test-' } },
                });
                break;
            case 'shows':
                await prisma.showComedian.deleteMany({
                    where: { id: { startsWith: 'test-' } },
                });
                await prisma.ticketInventory.deleteMany({
                    where: { id: { startsWith: 'test-' } },
                });
                await prisma.show.deleteMany({
                    where: { id: { startsWith: 'test-' } },
                });
                break;
            case 'users':
                await prisma.session.deleteMany({
                    where: { id: { startsWith: 'test-' } },
                });
                await prisma.account.deleteMany({
                    where: { id: { startsWith: 'test-' } },
                });
                await prisma.user.deleteMany({
                    where: { id: { startsWith: 'test-' } },
                });
                break;
        }
    }
}

/**
 * Reset test data to a known state
 */
export async function resetToCleanState(): Promise<void> {
    await cleanupTestData();
}

/**
 * Wrapper for test suites that need database cleanup
 */
export function withDatabaseCleanup(
    testFn: () => void | Promise<void>
): () => Promise<void> {
    return async () => {
        try {
            await testFn();
        } finally {
            await cleanupTestData();
        }
    };
}
