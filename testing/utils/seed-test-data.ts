/**
 * Test Data Seeding
 * 
 * Provides functions to seed the test database with realistic data.
 */

import {
    getTestPrisma,
    createTestUser,
    createTestShow,
    createTestComedian,
    createOrganizerProfile,
    UserRole
} from '../config/test-db';

export interface SeededData {
    users: {
        audience: { id: string; email: string; role: UserRole };
        organizerVerified: { id: string; email: string; role: UserRole };
        organizerUnverified: { id: string; email: string; role: UserRole };
        admin: { id: string; email: string; role: UserRole };
    };
    shows: Array<{ id: string; title: string; createdBy: string }>;
    comedians: Array<{ id: string; name: string }>;
}

/**
 * Seed database with standard test data
 */
export async function seedTestData(): Promise<SeededData> {
    // Create users with different roles
    const audience = await createTestUser(UserRole.AUDIENCE, {
        id: 'test-seed-audience',
        email: 'audience@seedtest.com',
        name: 'Seeded Audience User',
    });

    const organizerVerified = await createTestUser(UserRole.ORGANIZER_VERIFIED, {
        id: 'test-seed-org-verified',
        email: 'organizer@seedtest.com',
        name: 'Seeded Verified Organizer',
    });

    const organizerUnverified = await createTestUser(UserRole.ORGANIZER_UNVERIFIED, {
        id: 'test-seed-org-unverified',
        email: 'unverified@seedtest.com',
        name: 'Seeded Unverified Organizer',
    });

    const admin = await createTestUser(UserRole.ADMIN, {
        id: 'test-seed-admin',
        email: 'admin@seedtest.com',
        name: 'Seeded Admin User',
    });

    // Create organizer profile
    await createOrganizerProfile(organizerVerified.id, {
        id: 'test-seed-org-profile',
        name: 'Seeded Comedy Club',
        venue: 'Test Venue, Hyderabad',
    });

    // Create comedians
    const comedian1 = await createTestComedian(organizerVerified.id, {
        id: 'test-seed-comedian-1',
        name: 'Seeded Comedian One',
        bio: 'A hilarious comedian for testing',
    });

    const comedian2 = await createTestComedian(organizerVerified.id, {
        id: 'test-seed-comedian-2',
        name: 'Seeded Comedian Two',
        bio: 'Another great comedian',
    });

    // Create shows
    const show1 = await createTestShow(organizerVerified.id, {
        id: 'test-seed-show-1',
        title: 'Seeded Comedy Night',
        venue: 'Test Venue, Hyderabad',
        ticketPrice: 500,
        totalTickets: 100,
        isPublished: true,
    });

    const show2 = await createTestShow(organizerVerified.id, {
        id: 'test-seed-show-2',
        title: 'Seeded Weekend Special',
        venue: 'Another Venue, Hyderabad',
        ticketPrice: 750,
        totalTickets: 50,
        isPublished: true,
    });

    // Link comedians to shows
    const prisma = getTestPrisma();
    await prisma.showComedian.createMany({
        data: [
            { id: 'test-seed-sc-1', showId: show1.id, comedianId: comedian1.id, order: 1 },
            { id: 'test-seed-sc-2', showId: show1.id, comedianId: comedian2.id, order: 2 },
            { id: 'test-seed-sc-3', showId: show2.id, comedianId: comedian1.id, order: 1 },
        ],
    });

    return {
        users: {
            audience: { id: audience.id, email: audience.email, role: audience.role },
            organizerVerified: { id: organizerVerified.id, email: organizerVerified.email, role: organizerVerified.role },
            organizerUnverified: { id: organizerUnverified.id, email: organizerUnverified.email, role: organizerUnverified.role },
            admin: { id: admin.id, email: admin.email, role: admin.role },
        },
        shows: [
            { id: show1.id, title: show1.title, createdBy: organizerVerified.id },
            { id: show2.id, title: show2.title, createdBy: organizerVerified.id },
        ],
        comedians: [
            { id: comedian1.id, name: comedian1.name },
            { id: comedian2.id, name: comedian2.name },
        ],
    };
}

/**
 * Seed minimal data for quick tests
 */
export async function seedMinimalData(): Promise<{
    user: { id: string; email: string; role: UserRole };
    show: { id: string; title: string };
}> {
    const user = await createTestUser(UserRole.AUDIENCE, {
        id: 'test-minimal-user',
        email: 'minimal@test.com',
    });

    const organizer = await createTestUser(UserRole.ORGANIZER_VERIFIED, {
        id: 'test-minimal-organizer',
        email: 'minimalorg@test.com',
    });

    const show = await createTestShow(organizer.id, {
        id: 'test-minimal-show',
        title: 'Minimal Test Show',
    });

    // Add a comedian to make the show bookable
    const comedian = await createTestComedian(organizer.id, {
        id: 'test-minimal-comedian',
        name: 'Minimal Comedian',
    });

    const prisma = getTestPrisma();
    await prisma.showComedian.create({
        data: {
            id: 'test-minimal-sc',
            showId: show.id,
            comedianId: comedian.id,
            order: 1,
        },
    });

    return { user, show };
}
