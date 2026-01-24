/**
 * Unit Tests: Profile API
 * 
 * Tests for /api/profile/update endpoints
 */

import { UserRole } from '@prisma/client';
import {
    getTestPrisma,
    createTestUser,
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

describe('Profile API - /api/profile/update', () => {
    let testUser: { id: string; email: string; role: UserRole };

    beforeAll(async () => {
        testUser = await createTestUser(UserRole.AUDIENCE, {
            id: 'test-profile-api-user',
            email: 'profile-api@test.com',
        });
    });

    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/profile/update', () => {
        let POST: any;

        beforeAll(async () => {
            const module = await import('@/app/api/profile/update/route');
            POST = module.POST;
        });

        it('should return 401 for unauthenticated user', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new Request('http://localhost:3000/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'New Name' }),
            });

            const response = await POST(request as any);

            expect(response.status).toBe(401);
        });

        it('should update basic user info for AUDIENCE', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testUser.id,
                email: testUser.email,
                role: UserRole.AUDIENCE,
            } as any);

            const updateData = {
                name: 'Updated Name',
                city: 'Test City',
                bio: 'Updated Bio'
            };

            const request = new Request('http://localhost:3000/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            const response = await POST(request as any);

            expect(response.status).toBe(200);

            const prisma = getTestPrisma();
            const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
            expect(updatedUser?.name).toBe(updateData.name);
            expect(updatedUser?.city).toBe(updateData.city);
            expect(updatedUser?.bio).toBe(updateData.bio);
        });

        it('should enforce YouTube video limits (max 1)', async () => {
            const comedian = await createTestUser(UserRole.COMEDIAN_VERIFIED, {
                id: 'test-profile-limit-comedian',
            });

            mockGetCurrentUser.mockResolvedValue({
                id: comedian.id,
                email: comedian.email,
                role: UserRole.COMEDIAN_VERIFIED,
            } as any);

            const request = new Request('http://localhost:3000/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comedianYoutubeUrls: ['url1', 'url2'] // Over limit
                }),
            });

            const response = await POST(request as any);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toContain('Maximum 1 YouTube video');
        });

        it('should enforce Instagram reel limits (max 2)', async () => {
            const comedian = await createTestUser(UserRole.COMEDIAN_VERIFIED, {
                id: 'test-profile-limit-ig-comedian',
            });

            mockGetCurrentUser.mockResolvedValue({
                id: comedian.id,
                email: comedian.email,
                role: UserRole.COMEDIAN_VERIFIED,
            } as any);

            const request = new Request('http://localhost:3000/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comedianInstagramUrls: ['url1', 'url2', 'url3'] // Over limit
                }),
            });

            const response = await POST(request as any);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toContain('Maximum 2 Instagram reels');
        });

        it('should save social handles in socialLinks JSON', async () => {
            const comedian = await createTestUser(UserRole.COMEDIAN_VERIFIED, {
                id: 'test-profile-social-comedian',
            });

            mockGetCurrentUser.mockResolvedValue({
                id: comedian.id,
                email: comedian.email,
                role: UserRole.COMEDIAN_VERIFIED,
            } as any);

            const socialLinks = {
                youtube: 'yt_handle',
                instagram: 'ig_handle'
            };

            const request = new Request('http://localhost:3000/api/profile/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comedianSocialLinks: socialLinks
                }),
            });

            const response = await POST(request as any);

            expect(response.status).toBe(200);

            const prisma = getTestPrisma();
            const profile = await prisma.comedianProfile.findUnique({ where: { userId: comedian.id } });
            // Compare as separate fields if socialLinks is not exactly JSON in TS typing
            expect((profile?.socialLinks as any)?.youtube).toBe(socialLinks.youtube);
            expect((profile?.socialLinks as any)?.instagram).toBe(socialLinks.instagram);
        });
    });
});
