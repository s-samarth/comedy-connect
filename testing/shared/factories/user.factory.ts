import { faker } from '@faker-js/faker';

/**
 * Factory for generating mock User data
 * Matches the User model from Prisma schema
 */

export interface MockUser {
    id: string;
    email: string;
    name: string | null;
    role: 'AUDIENCE' | 'ORGANIZER_UNVERIFIED' | 'ORGANIZER_VERIFIED' | 'COMEDIAN_UNVERIFIED' | 'COMEDIAN_VERIFIED' | 'ADMIN';
    image?: string | null;
    onboardingCompleted: boolean;
    city?: string | null;
    age?: number | null;
    phone?: string | null;
    bio?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export function createMockUser(overrides?: Partial<MockUser>): MockUser {
    return {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: 'AUDIENCE',
        image: faker.image.avatar(),
        onboardingCompleted: true,
        city: faker.location.city(),
        age: faker.number.int({ min: 18, max: 65 }),
        phone: faker.phone.number(),
        bio: faker.lorem.sentence(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        ...overrides,
    };
}

export function createMockAdmin(overrides?: Partial<MockUser>): MockUser {
    return createMockUser({
        role: 'ADMIN',
        email: 'admin@test.com',
        ...overrides,
    });
}

export function createMockVerifiedOrganizer(overrides?: Partial<MockUser>): MockUser {
    return createMockUser({
        role: 'ORGANIZER_VERIFIED',
        ...overrides,
    });
}

export function createMockUnverifiedOrganizer(overrides?: Partial<MockUser>): MockUser {
    return createMockUser({
        role: 'ORGANIZER_UNVERIFIED',
        onboardingCompleted: true,
        ...overrides,
    });
}

export function createMockVerifiedComedian(overrides?: Partial<MockUser>): MockUser {
    return createMockUser({
        role: 'COMEDIAN_VERIFIED',
        ...overrides,
    });
}

export function createMockUnverifiedComedian(overrides?: Partial<MockUser>): MockUser {
    return createMockUser({
        role: 'COMEDIAN_UNVERIFIED',
        onboardingCompleted: true,
        ...overrides,
    });
}

export function createMockAudienceUser(overrides?: Partial<MockUser>): MockUser {
    return createMockUser({
        role: 'AUDIENCE',
        ...overrides,
    });
}
