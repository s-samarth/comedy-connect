
import { UserRole } from '@prisma/client';
import {
    requireOrganizer,
    requireComedian,
    requireShowCreator,
    isVerifiedOrganizer,
    isVerifiedComedian,
    isVerifiedShowCreator
} from '@/lib/auth';

// -----------------------------------------------------------------------------
// Mocks
// -----------------------------------------------------------------------------

// 1. Mock the auth options route
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
    authOptions: {}
}));

// 2. Mock next/headers
jest.mock('next/headers', () => ({
    cookies: () => ({
        get: jest.fn(),
    })
}));

// 3. Mock next-auth to control session
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(),
}));

// 4. Mock Prisma to avoid DB calls
jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        }
    }
}));

import { getServerSession } from 'next-auth/next';
const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>;

// We need to import the prisma mock to control it
import { prisma } from '@/lib/prisma';
const mockFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe('Security: RBAC Hierarchy & Privilege Inheritance', () => {

    // Define the roles in assumed ascending order of privilege for their respective tracks
    const ROLES = {
        AUDIENCE: UserRole.AUDIENCE,
        ORGANIZER_UNVERIFIED: UserRole.ORGANIZER_UNVERIFIED,
        ORGANIZER_VERIFIED: UserRole.ORGANIZER_VERIFIED,
        COMEDIAN_UNVERIFIED: UserRole.COMEDIAN_UNVERIFIED,
        COMEDIAN_VERIFIED: UserRole.COMEDIAN_VERIFIED,
        ADMIN: UserRole.ADMIN,
    };

    // Helper to setup the mock user for a test
    const setupUser = (role: UserRole) => {
        const user = {
            id: 'test-user-id',
            email: 'test@example.com',
            role: role,
            name: 'Test User',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Mock session to succeed and return user ID
        mockGetServerSession.mockResolvedValue({
            user: { id: user.id, email: user.email }
        });

        // Mock DB lookup to return full user object including Role
        mockFindUnique.mockResolvedValue(user as any);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Admin Omnipotence (Highest Privilege)', () => {
        beforeEach(() => setupUser(ROLES.ADMIN));

        it('Admin should pass requireOrganizer', async () => {
            await expect(requireOrganizer()).resolves.toBeDefined();
        });

        it('Admin should pass requireComedian', async () => {
            await expect(requireComedian()).resolves.toBeDefined();
        });

        it('Admin should pass requireShowCreator', async () => {
            await expect(requireShowCreator()).resolves.toBeDefined();
        });

        it('Admin should count as verified organizer', () => {
            expect(isVerifiedOrganizer(ROLES.ADMIN)).toBe(true);
        });

        it('Admin should count as verified comedian', () => {
            expect(isVerifiedComedian(ROLES.ADMIN)).toBe(true);
        });

        it('Admin should count as verified show creator', () => {
            expect(isVerifiedShowCreator(ROLES.ADMIN)).toBe(true);
        });
    });

    describe('Hierarchy: Organizer Track', () => {

        describe('Audience (Lowest)', () => {
            beforeEach(() => setupUser(ROLES.AUDIENCE));
            it('should FAIL requireOrganizer', async () => {
                await expect(requireOrganizer()).rejects.toThrow('Access denied');
            });
            it('should NOT be verified organizer', () => {
                expect(isVerifiedOrganizer(ROLES.AUDIENCE)).toBe(false);
            });
        });

        describe('Unverified Organizer', () => {
            beforeEach(() => setupUser(ROLES.ORGANIZER_UNVERIFIED));
            it('should PASS requireOrganizer', async () => {
                await expect(requireOrganizer()).resolves.toBeDefined();
            });
            it('should NOT be verified organizer', () => {
                expect(isVerifiedOrganizer(ROLES.ORGANIZER_UNVERIFIED)).toBe(false);
            });
        });

        describe('Verified Organizer', () => {
            beforeEach(() => setupUser(ROLES.ORGANIZER_VERIFIED));
            it('should PASS requireOrganizer', async () => {
                await expect(requireOrganizer()).resolves.toBeDefined();
            });
            it('should BE verified organizer', () => {
                expect(isVerifiedOrganizer(ROLES.ORGANIZER_VERIFIED)).toBe(true);
            });
        });
    });

    describe('Hierarchy: Comedian Track', () => {

        describe('Audience (Lowest)', () => {
            beforeEach(() => setupUser(ROLES.AUDIENCE));
            it('should FAIL requireComedian', async () => {
                await expect(requireComedian()).rejects.toThrow('Access denied');
            });
            it('should NOT be verified comedian', () => {
                expect(isVerifiedComedian(ROLES.AUDIENCE)).toBe(false);
            });
        });

        describe('Unverified Comedian', () => {
            beforeEach(() => setupUser(ROLES.COMEDIAN_UNVERIFIED));
            it('should PASS requireComedian', async () => {
                await expect(requireComedian()).resolves.toBeDefined();
            });
            it('should NOT be verified comedian', () => {
                expect(isVerifiedComedian(ROLES.COMEDIAN_UNVERIFIED)).toBe(false);
            });
        });

        describe('Verified Comedian', () => {
            beforeEach(() => setupUser(ROLES.COMEDIAN_VERIFIED));
            it('should PASS requireComedian', async () => {
                await expect(requireComedian()).resolves.toBeDefined();
            });
            it('should BE verified comedian', () => {
                expect(isVerifiedComedian(ROLES.COMEDIAN_VERIFIED)).toBe(true);
            });
        });
    });

    describe('Cross-Role Restrictions (Separation of Concerns)', () => {
        // Ensure Comedians can't act as Organizers (unless Admin)
        it('Verified Comedian should FAIL requireOrganizer', async () => {
            setupUser(ROLES.COMEDIAN_VERIFIED);
            await expect(requireOrganizer()).rejects.toThrow('Access denied');
        });

        // Ensure Organizers can't act as Comedians (unless Admin)
        it('Verified Organizer should FAIL requireComedian', async () => {
            setupUser(ROLES.ORGANIZER_VERIFIED);
            await expect(requireComedian()).rejects.toThrow('Access denied');
        });
    });

});
