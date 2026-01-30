import { faker } from '@faker-js/faker';

/**
 * Factory for generating mock Show data
 * Matches the Show model from Prisma schema
 */

export interface MockShow {
    id: string;
    title: string;
    description: string | null;
    date: Date;
    time: string;
    venue: string;
    city: string;
    address: string | null;
    duration: number;
    category: string;
    language: string | null;
    ticketPrice: number;
    totalSeats: number;
    availableSeats: number;
    posterImageUrl: string | null;
    isPublished: boolean;
    isDisbursed: boolean;
    creatorId: string;
    platformFeePercent: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export function createMockShow(overrides?: Partial<MockShow>): MockShow {
    const totalSeats = faker.number.int({ min: 50, max: 500 });
    const availableSeats = faker.number.int({ min: 0, max: totalSeats });

    return {
        id: faker.string.uuid(),
        title: `${faker.company.catchPhrase()} Comedy Night`,
        description: faker.lorem.paragraph(),
        date: faker.date.future(),
        time: '19:00:00',
        venue: faker.company.name() + ' Hall',
        city: 'Hyderabad',
        address: faker.location.streetAddress(),
        duration: faker.helpers.arrayElement([60, 90, 120]),
        category: 'Standup',
        language: faker.helpers.arrayElement(['English', 'Hindi', 'Telugu']),
        ticketPrice: faker.number.int({ min: 200, max: 1500 }),
        totalSeats,
        availableSeats,
        posterImageUrl: faker.image.url(),
        isPublished: true,
        isDisbursed: false,
        creatorId: faker.string.uuid(),
        platformFeePercent: 10,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        ...overrides,
    };
}

export function createMockDraftShow(overrides?: Partial<MockShow>): MockShow {
    return createMockShow({
        isPublished: false,
        availableSeats: overrides?.totalSeats || 100,
        ...overrides,
    });
}

export function createMockPublishedShow(overrides?: Partial<MockShow>): MockShow {
    return createMockShow({
        isPublished: true,
        ...overrides,
    });
}

export function createMockSoldOutShow(overrides?: Partial<MockShow>): MockShow {
    return createMockShow({
        isPublished: true,
        availableSeats: 0,
        ...overrides,
    });
}

export function createMockPastShow(overrides?: Partial<MockShow>): MockShow {
    return createMockShow({
        date: faker.date.past(),
        isPublished: true,
        ...overrides,
    });
}

export function createMockUpcomingShow(overrides?: Partial<MockShow>): MockShow {
    return createMockShow({
        date: faker.date.future({ years: 0.5 }),
        isPublished: true,
        ...overrides,
    });
}
