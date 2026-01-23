/**
 * Unit Tests: Admin API
 * 
 * Tests for /api/admin/* endpoints
 */

import { UserRole } from '@prisma/client';
import { NextRequest } from 'next/server';
import {
    getTestPrisma,
    createTestUser,
    createOrganizerProfile,
    cleanupTestData,
    disconnectTestDb
} from '../../config/test-db';

// Mock the auth module
jest.mock('@/lib/auth', () => ({
    getCurrentUser: jest.fn(),
    requireAdmin: jest.fn(),
}));

jest.mock('@/lib/admin-password', () => ({
    verifyAdminSession: jest.fn(),
}));

// Import after mocking
import * as authModule from '@/lib/auth';
import * as adminPasswordModule from '@/lib/admin-password';

const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;
const mockRequireAdmin = authModule.requireAdmin as jest.MockedFunction<typeof authModule.requireAdmin>;
const mockVerifyAdminSession = adminPasswordModule.verifyAdminSession as jest.MockedFunction<typeof adminPasswordModule.verifyAdminSession>;

describe('Admin API - /api/admin/*', () => {
    let testAdmin: { id: string; email: string; role: UserRole };
    let testAudience: { id: string; email: string; role: UserRole };
    let testOrganizer: { id: string; email: string; role: UserRole };

    beforeAll(async () => {
        // Create test users
        testAdmin = await createTestUser(UserRole.ADMIN, {
            id: 'test-admin-api-admin',
            email: 'admin-api@test.com',
        });

        testAudience = await createTestUser(UserRole.AUDIENCE, {
            id: 'test-admin-api-audience',
            email: 'audience-admin-api@test.com',
        });

        testOrganizer = await createTestUser(UserRole.ORGANIZER_UNVERIFIED, {
            id: 'test-admin-api-organizer',
            email: 'organizer-admin-api@test.com',
        });

        // Create organizer profile for approval testing
        await createOrganizerProfile(testOrganizer.id, {
            id: 'test-admin-org-profile',
            name: 'Test Org for Admin',
        });
    });

    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Default to denied access
        mockRequireAdmin.mockRejectedValue(new Error('Access denied'));
        mockVerifyAdminSession.mockResolvedValue({ valid: false });
    });

    describe('GET /api/admin/organizers', () => {
        // Dynamically import the route
        let GET: any;

        beforeAll(async () => {
            const module = await import('@/app/api/admin/organizers/route');
            GET = module.GET;
        });

        it('should return 401/403 for unauthenticated user', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/admin/organizers');
            const response = await GET(request);

            expect([401, 403]).toContain(response.status);
        });

        it('should return 403 for non-admin user (AUDIENCE)', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testAudience.id,
                email: testAudience.email,
                role: UserRole.AUDIENCE,
            } as any);

            const request = new NextRequest('http://localhost:3000/api/admin/organizers');
            const response = await GET(request);

            expect(response.status).toBe(403);
        });

        it('should return 403 for ORGANIZER_VERIFIED', async () => {
            const verifiedOrg = await createTestUser(UserRole.ORGANIZER_VERIFIED, {
                id: 'test-verified-org-access',
                email: 'verified-org@test.com',
            });

            mockGetCurrentUser.mockResolvedValue({
                id: verifiedOrg.id,
                email: verifiedOrg.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);

            const request = new NextRequest('http://localhost:3000/api/admin/organizers');
            const response = await GET(request);

            expect(response.status).toBe(403);
        });

        it('should return 200 with organizers list for ADMIN', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testAdmin.id,
                email: testAdmin.email,
                role: UserRole.ADMIN,
            } as any);
            mockRequireAdmin.mockResolvedValue({ id: testAdmin.id } as any);

            const request = new NextRequest('http://localhost:3000/api/admin/organizers');
            const response = await GET(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('organizers');
            expect(Array.isArray(data.organizers)).toBe(true);
        });
    });

    describe('GET /api/admin/shows', () => {
        let GET: any;

        beforeAll(async () => {
            const module = await import('@/app/api/admin/shows/route');
            GET = module.GET;
        });

        it('should return 401/403 for unauthenticated user', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/admin/shows');
            const response = await GET(request);

            expect([401, 403]).toContain(response.status);
        });

        it('should return 403 for non-admin user', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testAudience.id,
                email: testAudience.email,
                role: UserRole.AUDIENCE,
            } as any);

            const request = new NextRequest('http://localhost:3000/api/admin/shows');
            const response = await GET(request);

            expect([401, 403]).toContain(response.status);
        });

        it('should return 200 with shows list for ADMIN', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testAdmin.id,
                email: testAdmin.email,
                role: UserRole.ADMIN,
            } as any);
            mockVerifyAdminSession.mockResolvedValue({ valid: true });
            mockVerifyAdminSession.mockResolvedValue({ valid: true });

            const request = new NextRequest('http://localhost:3000/api/admin/shows');
            const response = await GET(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('shows');
            expect(Array.isArray(data.shows)).toBe(true);
        });
    });

    describe('GET /api/admin/comedians', () => {
        let GET: any;

        beforeAll(async () => {
            const module = await import('@/app/api/admin/comedians/route');
            GET = module.GET;
        });

        it('should return 401/403 for unauthenticated user', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/admin/comedians');
            const response = await GET(request);

            expect([401, 403]).toContain(response.status);
        });

        it('should return 403 for non-admin user', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testAudience.id,
                email: testAudience.email,
                role: UserRole.AUDIENCE,
            } as any);

            const request = new NextRequest('http://localhost:3000/api/admin/comedians');
            const response = await GET(request);

            expect(response.status).toBe(403);
        });

        it('should return 200 with comedians list for ADMIN', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testAdmin.id,
                email: testAdmin.email,
                role: UserRole.ADMIN,
            } as any);
            mockVerifyAdminSession.mockResolvedValue({ valid: true });

            const request = new NextRequest('http://localhost:3000/api/admin/comedians');
            const response = await GET(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('comedians');
            expect(Array.isArray(data.comedians)).toBe(true);
        });
    });

    describe('GET /api/admin/fees', () => {
        let GET: any;

        beforeAll(async () => {
            const module = await import('@/app/api/admin/fees/route');
            GET = module.GET;
        });

        it('should return 401/403 for unauthenticated user', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new NextRequest('http://localhost:3000/api/admin/fees');
            const response = await GET(request);

            expect([401, 403]).toContain(response.status);
        });

        it('should return 403 for non-admin user', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testAudience.id,
                email: testAudience.email,
                role: UserRole.AUDIENCE,
            } as any);

            const request = new NextRequest('http://localhost:3000/api/admin/fees');
            const response = await GET(request);

            expect(response.status).toBe(403);
        });

        it('should return 200 with fees config for ADMIN', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testAdmin.id,
                email: testAdmin.email,
                role: UserRole.ADMIN,
            } as any);
            mockRequireAdmin.mockResolvedValue({ id: testAdmin.id } as any);
            mockVerifyAdminSession.mockResolvedValue({ valid: true });

            const request = new NextRequest('http://localhost:3000/api/admin/fees');
            const response = await GET(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            // Fees endpoint should return some configuration
            expect(data).toBeTruthy();
        });
    });
});
