/**
 * Integration Tests: Admin Management Flow
 * 
 * End-to-end tests for admin management capabilities
 */

import { UserRole } from '@prisma/client';
import { NextRequest } from 'next/server';
import {
    getTestPrisma,
    createTestUser,
    createTestShow,
    createTestComedian,
    createOrganizerProfile,
    cleanupTestData,
    disconnectTestDb
} from '../config/test-db';

// Mock the auth module
jest.mock('@/lib/auth', () => ({
    getCurrentUser: jest.fn(),
    requireAdmin: jest.fn(),
}));

jest.mock('@/lib/admin-password', () => ({
    verifyAdminSession: jest.fn(),
}));

import * as authModule from '@/lib/auth';
import * as adminPasswordModule from '@/lib/admin-password';

const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;
const mockRequireAdmin = authModule.requireAdmin as jest.MockedFunction<typeof authModule.requireAdmin>;
const mockVerifyAdminSession = adminPasswordModule.verifyAdminSession as jest.MockedFunction<typeof adminPasswordModule.verifyAdminSession>;

describe('Integration: Admin Management Flow', () => {
    const prisma = getTestPrisma();
    let admin: { id: string; email: string; role: UserRole };
    let organizer: { id: string; email: string; role: UserRole };

    beforeAll(async () => {
        admin = await createTestUser(UserRole.ADMIN, {
            email: `admin-mgmt-${Date.now()}@test.com`,
        });

        organizer = await createTestUser(UserRole.ORGANIZER_VERIFIED, {
            email: `admin-org-${Date.now()}@test.com`,
        });
    });

    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireAdmin.mockRejectedValue(new Error('Access denied'));
        mockVerifyAdminSession.mockResolvedValue({ valid: false });
    });

    describe('Admin Dashboard Access', () => {
        it('Admin can view all organizers', async () => {
            // Create some test organizers
            const unverified = await createTestUser(UserRole.ORGANIZER_UNVERIFIED, {
                id: 'test-admin-view-org-1',
                email: 'admin-view-org1@test.com',
            });
            await createOrganizerProfile(unverified.id, {
                id: 'test-admin-view-profile-1',
                name: 'Viewable Org 1',
            });

            const { GET } = await import('@/app/api/admin/organizers/route');

            mockGetCurrentUser.mockResolvedValue({
                id: admin.id,
                email: admin.email,
                role: UserRole.ADMIN,
            } as any);
            mockRequireAdmin.mockResolvedValue({
                id: admin.id,
                email: admin.email,
                role: UserRole.ADMIN,
            } as any);

            const request = new NextRequest('http://localhost:3000/api/admin/organizers');
            const response = await GET();
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.organizers.length).toBeGreaterThanOrEqual(1);
        });

        it('Admin can view all shows', async () => {
            // Create test shows
            await createTestShow(organizer.id, {
                id: 'test-admin-view-show',
                title: 'Admin Viewable Show',
            });

            const { GET } = await import('@/app/api/admin/shows/route');

            mockRequireAdmin.mockResolvedValue({
                id: admin.id,
                email: admin.email,
                role: UserRole.ADMIN,
            } as any);

            const request = new NextRequest('http://localhost:3000/api/admin/shows');
            const response = await GET(request);
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.shows.length).toBeGreaterThanOrEqual(1);
        });

        it('Admin can view all comedians', async () => {
            await createTestComedian(organizer.id, {
                id: 'test-admin-view-comedian',
                name: 'Admin Viewable Comedian',
            });

            const { GET } = await import('@/app/api/admin/comedians/route');

            mockGetCurrentUser.mockResolvedValue({
                id: admin.id,
                email: admin.email,
                role: UserRole.ADMIN,
            } as any);
            mockRequireAdmin.mockResolvedValue({
                id: admin.id,
                email: admin.email,
                role: UserRole.ADMIN,
            } as any);

            const request = new NextRequest('http://localhost:3000/api/admin/comedians');
            const response = await GET();
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.comedians.length).toBeGreaterThanOrEqual(1);
        });

        it('Admin can view collections', async () => {
            const { GET } = await import('@/app/api/admin/collections/route');

            mockGetCurrentUser.mockResolvedValue({
                id: admin.id,
                email: admin.email,
                role: UserRole.ADMIN,
            } as any);
            mockRequireAdmin.mockResolvedValue({
                id: admin.id,
                email: admin.email,
                role: UserRole.ADMIN,
            } as any);

            const request = new NextRequest('http://localhost:3000/api/admin/collections');
            const response = await GET(request);
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data).toHaveProperty('lifetime');
            expect(data.lifetime).toHaveProperty('showEarnings');
        });
    });

    describe('Admin Fee Configuration', () => {
        it('Admin can view fee configuration', async () => {
            const { GET } = await import('@/app/api/admin/fees/route');

            mockGetCurrentUser.mockResolvedValue({
                id: admin.id,
                email: admin.email,
                role: UserRole.ADMIN,
            } as any);
            mockRequireAdmin.mockResolvedValue({
                id: admin.id,
                email: admin.email,
                role: UserRole.ADMIN,
            } as any);

            const request = new NextRequest('http://localhost:3000/api/admin/fees');
            const response = await GET();
            expect(response.status).toBe(200);
        });

        it('Non-admin cannot view fee configuration', async () => {
            const { GET } = await import('@/app/api/admin/fees/route');

            mockGetCurrentUser.mockResolvedValue({
                id: organizer.id,
                email: organizer.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockRequireAdmin.mockRejectedValue(new Error('Access denied: Admin role required'));

            const request = new NextRequest('http://localhost:3000/api/admin/fees');
            const response = await GET();
            expect(response.status).toBe(403);
        });
    });

    describe('Admin Security', () => {
        it('Non-admin users are blocked from all admin endpoints', async () => {
            const regularUser = await createTestUser(UserRole.AUDIENCE, {
                id: 'test-blocked-user-' + Date.now(),
                email: `blocked-${Date.now()}@test.com`,
            });

            const endpoints = [
                '@/app/api/admin/organizers/route',
                '@/app/api/admin/shows/route',
                '@/app/api/admin/comedians/route',
                '@/app/api/admin/fees/route',
            ];

            for (const endpoint of endpoints) {
                const { GET } = await import(endpoint);

                mockGetCurrentUser.mockResolvedValue({
                    id: regularUser.id,
                    email: regularUser.email,
                    role: UserRole.AUDIENCE,
                } as any);

                const request = new NextRequest(`http://localhost:3000${endpoint.replace('@/app', '')}`);
                const response = await (GET as any)(request);
                expect([401, 403]).toContain(response.status);
            }
        });
    });
});
