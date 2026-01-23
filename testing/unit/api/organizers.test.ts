/**
 * Unit Tests: Organizers API
 * 
 * Tests for /api/organizer/* endpoints
 */

import { UserRole } from '@prisma/client';
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
}));

// Import after mocking
import * as authModule from '@/lib/auth';

const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;

describe('Organizer API - /api/organizer/*', () => {
    let testOrganizer: { id: string; email: string; role: UserRole };
    let testAudience: { id: string; email: string; role: UserRole };

    beforeAll(async () => {
        testOrganizer = await createTestUser(UserRole.ORGANIZER_VERIFIED, {
            id: 'test-org-api-organizer',
            email: 'org-api@test.com',
        });

        testAudience = await createTestUser(UserRole.AUDIENCE, {
            id: 'test-org-api-audience',
            email: 'audience-org-api@test.com',
        });
    });

    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/organizer/profile', () => {
        let GET: any;

        beforeAll(async () => {
            const module = await import('@/app/api/organizer/profile/route');
            GET = module.GET;
        });

        it('should return 401 for unauthenticated user', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const response = await GET();

            expect(response.status).toBe(401);
        });

        it('should return 404 for user without organizer profile', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testAudience.id,
                email: testAudience.email,
                role: UserRole.AUDIENCE,
            } as any);

            const response = await GET();

            // Should return 404 or empty profile
            expect([200, 404]).toContain(response.status);
        });

        it('should return profile for organizer with existing profile', async () => {
            // Create profile for organizer
            await createOrganizerProfile(testOrganizer.id, {
                id: 'test-org-profile-get',
                name: 'Test Organizer Profile',
            });

            mockGetCurrentUser.mockResolvedValue({
                id: testOrganizer.id,
                email: testOrganizer.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);

            const response = await GET();

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.profile || data.name).toBeTruthy();
        });
    });

    describe('POST /api/organizer/profile', () => {
        let POST: any;

        beforeAll(async () => {
            const module = await import('@/app/api/organizer/profile/route');
            POST = module.POST;
        });

        it('should return 401 for unauthenticated user', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new Request('http://localhost:3000/api/organizer/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Test Org', venue: 'Test Venue' }),
            });

            const response = await POST(request);

            expect(response.status).toBe(401);
        });

        it('should create/update profile for authenticated user', async () => {
            const newUser = await createTestUser(UserRole.AUDIENCE, {
                id: 'test-new-org-' + Date.now(),
                email: `new-org-${Date.now()}@test.com`,
            });

            mockGetCurrentUser.mockResolvedValue({
                id: newUser.id,
                email: newUser.email,
                role: UserRole.AUDIENCE,
            } as any);

            const request = new Request('http://localhost:3000/api/organizer/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'New Organizer ' + Date.now(),
                    venue: 'New Venue',
                    description: 'Test description',
                }),
            });

            const response = await POST(request);

            expect([200, 201]).toContain(response.status);
        });
    });
});
