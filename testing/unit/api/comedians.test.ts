/**
 * Unit Tests: Comedians API
 * 
 * Tests for /api/comedians endpoints
 */

import { UserRole } from '@prisma/client';
import {
    getTestPrisma,
    createTestUser,
    createTestComedian,
    cleanupTestData,
    disconnectTestDb
} from '../../config/test-db';

// Mock the auth module
jest.mock('@/lib/auth', () => ({
    getCurrentUser: jest.fn(),
}));

// Import after mocking
import * as authModule from '@/lib/auth';

const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;

describe('Comedians API - /api/comedians', () => {
    let testOrganizer: { id: string; email: string; role: UserRole };
    let testAudience: { id: string; email: string; role: UserRole };

    beforeAll(async () => {
        testOrganizer = await createTestUser(UserRole.ORGANIZER_VERIFIED, {
            id: 'test-comedian-api-organizer',
            email: 'comedian-api-org@test.com',
        });

        testAudience = await createTestUser(UserRole.AUDIENCE, {
            id: 'test-comedian-api-audience',
            email: 'comedian-api-aud@test.com',
        });

        // Create some test comedians
        await createTestComedian(testOrganizer.id, {
            id: 'test-comedian-list-1',
            name: 'List Comedian One',
        });
        await createTestComedian(testOrganizer.id, {
            id: 'test-comedian-list-2',
            name: 'List Comedian Two',
        });
    });

    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/comedians', () => {
        let GET: any;

        beforeAll(async () => {
            const module = await import('@/app/api/comedians/route');
            GET = module.GET;
        });

        it('should return 200 with comedians list (public or auth required based on implementation)', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testAudience.id,
                email: testAudience.email,
                role: UserRole.AUDIENCE,
            } as any);

            const response = await GET();

            // May be 200 (public) or 401 (auth required)
            expect([200, 401]).toContain(response.status);

            if (response.status === 200) {
                const data = await response.json();
                expect(data).toHaveProperty('comedians');
                expect(Array.isArray(data.comedians)).toBe(true);
            }
        });

        it('should return comedians for ORGANIZER_VERIFIED', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testOrganizer.id,
                email: testOrganizer.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);

            const response = await GET();

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('comedians');
            expect(Array.isArray(data.comedians)).toBe(true);
        });
    });

    describe('POST /api/comedians', () => {
        let POST: any;

        beforeAll(async () => {
            const module = await import('@/app/api/comedians/route');
            POST = module.POST;
        });

        const validComedianData = {
            name: 'Test Comedian',
            bio: 'A test comedian bio',
        };

        it('should return 401 for unauthenticated user', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new Request('http://localhost:3000/api/comedians', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validComedianData),
            });

            const response = await POST(request);

            expect([401, 403]).toContain(response.status);
        });

        it('should return 403 for AUDIENCE role', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testAudience.id,
                email: testAudience.email,
                role: UserRole.AUDIENCE,
            } as any);

            const request = new Request('http://localhost:3000/api/comedians', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validComedianData),
            });

            const response = await POST(request);

            expect(response.status).toBe(403);
        });

        it('should create comedian for ORGANIZER_VERIFIED', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testOrganizer.id,
                email: testOrganizer.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);

            const request = new Request('http://localhost:3000/api/comedians', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...validComedianData,
                    name: 'Created Comedian ' + Date.now(),
                }),
            });

            const response = await POST(request);

            expect([200, 201]).toContain(response.status);
            const data = await response.json();
            expect(data.comedian || data.id).toBeTruthy();
        });

        it('should return 400 for invalid data (missing name)', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testOrganizer.id,
                email: testOrganizer.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);

            const request = new Request('http://localhost:3000/api/comedians', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bio: 'Bio without name' }),
            });

            const response = await POST(request);

            expect(response.status).toBe(400);
        });
    });
});
