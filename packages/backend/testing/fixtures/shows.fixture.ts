import { prisma } from '../utils/prisma';
import type { Show } from '@prisma/client';

/**
 * Create a test show with optional overrides
 */
export async function createTestShow(overrides: Partial<Show> = {}): Promise<Show> {
    return await prisma.show.create({
        data: {
            title: `Test Comedy Show ${Date.now()}`,
            description: 'A hilarious night of standup comedy',
            date: new Date('2026-06-01'),
            time: '19:00:00',
            venue: 'Test Venue',
            city: 'Hyderabad',
            address: '123 Test Street',
            duration: 90,
            category: 'Standup',
            language: 'English',
            ticketPrice: 500,
            totalSeats: 100,
            availableSeats: 100,
            isPublished: false,
            isDisbursed: false,
            platformFeePercent: 10,
            creatorId: 'default-creator-id', // Should be overridden
            ...overrides,
        },
    });
}

/**
 * Create multiple test shows
 */
export async function createTestShows(count: number, overrides: Partial<Show> = {}): Promise<Show[]> {
    const shows: Show[] = [];
    for (let i = 0; i < count; i++) {
        const show = await createTestShow({
            title: `Test Comedy Show ${i + 1}`,
            ...overrides,
        });
        shows.push(show);
    }
    return shows;
}

/**
 * Create a published show ready for booking
 */
export async function createPublishedShow(creatorId: string, overrides: Partial<Show> = {}): Promise<Show> {
    return await createTestShow({
        creatorId,
        isPublished: true,
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        availableSeats: overrides.totalSeats || 100,
        ...overrides,
    });
}

/**
 * Create a sold-out show
 */
export async function createSoldOutShow(creatorId: string, overrides: Partial<Show> = {}): Promise<Show> {
    return await createTestShow({
        creatorId,
        isPublished: true,
        totalSeats: 100,
        availableSeats: 0,
        ...overrides,
    });
}

/**
 * Create a past show
 */
export async function createPastShow(creatorId: string, overrides: Partial<Show> = {}): Promise<Show> {
    return await createTestShow({
        creatorId,
        isPublished: true,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        ...overrides,
    });
}
