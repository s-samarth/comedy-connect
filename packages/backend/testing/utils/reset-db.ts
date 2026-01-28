import { prisma } from './prisma';

/**
 * Resets the database to a clean state.
 * Uses truncate to be faster than migrate reset.
 * 
 * call this in beforeEach() of integration tests.
 */
export async function resetDatabase() {
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('❌ Danger: resetDatabase called outside of test environment!');
    }

    const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== '_prisma_migrations')
        .map((name) => `"public"."${name}"`)
        .join(', ');

    if (!tables) return;

    try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
        console.error('Failed to reset database:', error);
        throw error;
    }
}
