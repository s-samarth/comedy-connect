/**
 * Security Tests: Role-Based Access Control
 * 
 * Tests to ensure RBAC is properly enforced across all endpoints
 */

import { UserRole } from '@prisma/client';
import {
    createTestUser,
    cleanupTestData,
    disconnectTestDb
} from '../config/test-db';

// Mock the auth module
jest.mock('@/lib/auth', () => ({
    getCurrentUser: jest.fn(),
    isVerifiedOrganizer: jest.fn(),
    requireOrganizer: jest.fn(),
    requireShowCreator: jest.fn(),
    isVerifiedShowCreator: jest.fn(),
    requireAdmin: jest.fn(),
}));

// Mock admin-password module for direct usage
jest.mock('@/lib/admin-password', () => ({
    verifyAdminSession: jest.fn(),
}));

import * as authModule from '@/lib/auth';

const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;
const mockIsVerifiedOrganizer = authModule.isVerifiedOrganizer as jest.MockedFunction<typeof authModule.isVerifiedOrganizer>;
const mockRequireOrganizer = authModule.requireOrganizer as jest.MockedFunction<typeof authModule.requireOrganizer>;
const mockRequireShowCreator = authModule.requireShowCreator as jest.MockedFunction<typeof authModule.requireShowCreator>;
const mockIsVerifiedShowCreator = authModule.isVerifiedShowCreator as jest.MockedFunction<typeof authModule.isVerifiedShowCreator>;
const mockRequireAdmin = authModule.requireAdmin as jest.MockedFunction<typeof authModule.requireAdmin>;

import * as adminPasswordModule from '@/lib/admin-password';
const mockVerifyAdminSession = adminPasswordModule.verifyAdminSession as jest.MockedFunction<typeof adminPasswordModule.verifyAdminSession>;

describe('Security: Role-Based Access Control', () => {
    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Define role access matrix
    const roleAccessMatrix: Array<{
        endpoint: string;
        method: string;
        allowedRoles: UserRole[];
        deniedRoles: UserRole[];
    }> = [
            {
                endpoint: '@/app/api/admin/organizers/route',
                method: 'GET',
                allowedRoles: [UserRole.ADMIN],
                deniedRoles: [UserRole.AUDIENCE, UserRole.ORGANIZER_VERIFIED, UserRole.ORGANIZER_UNVERIFIED],
            },
            {
                endpoint: '@/app/api/admin/shows/route',
                method: 'GET',
                allowedRoles: [UserRole.ADMIN],
                deniedRoles: [UserRole.AUDIENCE, UserRole.ORGANIZER_VERIFIED],
            },
            {
                endpoint: '@/app/api/admin/fees/route',
                method: 'GET',
                allowedRoles: [UserRole.ADMIN],
                deniedRoles: [UserRole.AUDIENCE, UserRole.ORGANIZER_VERIFIED],
            },
        ];

    describe('Admin-Only Endpoints', () => {
        for (const testCase of roleAccessMatrix) {
            describe(`${testCase.method} ${testCase.endpoint.split('/').pop()}`, () => {
                for (const role of testCase.allowedRoles) {
                    it(`should ALLOW ${role}`, async () => {
                        const user = await createTestUser(role, {
                            id: `test-rbac-allow-${role}-${Date.now()}`,
                            email: `rbac-allow-${role}-${Date.now()}@test.com`,
                        });

                        mockGetCurrentUser.mockResolvedValue({
                            id: user.id,
                            email: user.email,
                            role,
                        } as any);
                        mockRequireAdmin.mockResolvedValue({
                            id: user.id,
                            email: user.email,
                            role: UserRole.ADMIN,
                        } as any);
                        mockVerifyAdminSession.mockResolvedValue({ valid: true });

                        const module = await import(testCase.endpoint);
                        const handler = module[testCase.method];
                        const response = await handler();

                        expect(response.status).toBe(200);
                    });
                }

                for (const role of testCase.deniedRoles) {
                    it(`should DENY ${role}`, async () => {
                        const user = await createTestUser(role, {
                            id: `test-rbac-deny-${role}-${Date.now()}`,
                            email: `rbac-deny-${role}-${Date.now()}@test.com`,
                        });

                        mockGetCurrentUser.mockResolvedValue({
                            id: user.id,
                            email: user.email,
                            role,
                        } as any);
                        mockRequireAdmin.mockRejectedValue(new Error('Access denied: Admin role required'));
                        mockVerifyAdminSession.mockResolvedValue({ valid: false });

                        const module = await import(testCase.endpoint);
                        const handler = module[testCase.method];
                        const response = await handler();

                        expect([401, 403]).toContain(response.status);
                    });
                }
            });
        }
    });

    describe('Show Creation Access', () => {
        const showCreationData = {
            title: 'RBAC Test Show',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            venue: 'Test Venue, Hyderabad',
            googleMapsLink: 'https://maps.google.com/test',
            ticketPrice: 500,
            totalTickets: 100,
            comedianIds: [],
        };

        it('AUDIENCE cannot create shows', async () => {
            const user = await createTestUser(UserRole.AUDIENCE, {
                id: 'test-show-create-audience',
                email: 'show-create-aud@test.com',
            });

            mockGetCurrentUser.mockResolvedValue({
                id: user.id,
                email: user.email,
                role: UserRole.AUDIENCE,
            } as any);
            mockIsVerifiedOrganizer.mockReturnValue(false);
            mockRequireShowCreator.mockRejectedValue(new Error('Unauthorized'));

            const { POST } = await import('@/app/api/shows/route');
            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(showCreationData),
            });

            const response = await POST(request);
            expect(response.status).toBe(500);
        });

        it('ORGANIZER_UNVERIFIED cannot create shows', async () => {
            const user = await createTestUser(UserRole.ORGANIZER_UNVERIFIED, {
                id: 'test-show-create-unverified',
                email: 'show-create-unv@test.com',
            });

            mockGetCurrentUser.mockResolvedValue({
                id: user.id,
                email: user.email,
                role: UserRole.ORGANIZER_UNVERIFIED,
            } as any);
            mockIsVerifiedOrganizer.mockReturnValue(false);
            mockRequireShowCreator.mockRejectedValue(new Error('Unauthorized'));

            const { POST } = await import('@/app/api/shows/route');
            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(showCreationData),
            });

            const response = await POST(request);
            expect(response.status).toBe(500);
        });

        it('ORGANIZER_VERIFIED CAN create shows', async () => {
            const user = await createTestUser(UserRole.ORGANIZER_VERIFIED, {
                id: 'test-show-create-verified',
                email: 'show-create-ver@test.com',
            });

            mockGetCurrentUser.mockResolvedValue({
                id: user.id,
                email: user.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockIsVerifiedOrganizer.mockReturnValue(true);
            mockRequireShowCreator.mockResolvedValue({
                id: user.id,
                email: user.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockIsVerifiedShowCreator.mockReturnValue(true);

            const { POST } = await import('@/app/api/shows/route');
            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...showCreationData,
                    title: 'Verified Org Show ' + Date.now(),
                }),
            });

            const response = await POST(request);
            expect([200, 201]).toContain(response.status);
        });
    });

    describe('Comedian Management Access', () => {
        it('AUDIENCE cannot create comedians', async () => {
            const user = await createTestUser(UserRole.AUDIENCE, {
                id: 'test-comedian-create-aud',
                email: 'comedian-create-aud@test.com',
            });

            mockGetCurrentUser.mockResolvedValue({
                id: user.id,
                email: user.email,
                role: UserRole.AUDIENCE,
            } as any);
            mockRequireOrganizer.mockRejectedValue(new Error('Unauthorized'));

            const { POST } = await import('@/app/api/comedians/route');
            const request = new Request('http://localhost:3000/api/comedians', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Test Comedian', bio: 'Test bio' }),
            });

            const response = await POST(request);
            expect(response.status).toBe(500);
        });

        it('ORGANIZER_VERIFIED CAN create comedians', async () => {
            const user = await createTestUser(UserRole.ORGANIZER_VERIFIED, {
                id: 'test-comedian-create-org',
                email: 'comedian-create-org@test.com',
            });

            mockGetCurrentUser.mockResolvedValue({
                id: user.id,
                email: user.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockRequireOrganizer.mockResolvedValue({
                id: user.id,
                email: user.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockIsVerifiedOrganizer.mockReturnValue(true);

            const { POST } = await import('@/app/api/comedians/route');
            const request = new Request('http://localhost:3000/api/comedians', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Org Created Comedian ' + Date.now(), bio: 'Created by org' }),
            });

            const response = await POST(request);
            expect([200, 201]).toContain(response.status);
        });
    });
});
