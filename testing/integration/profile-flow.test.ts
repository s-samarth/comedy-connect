/**
 * Integration Test: Profile Management Flow
 * 
 * Verifies the end-to-end journey of a user managing their profile:
 * 1. Basic info update
 * 2. Role-specific branding (Comedian/Organizer)
 * 3. Media Portfolio limits and validation
 * 4. Social handles integration
 */

import { UserRole } from '@prisma/client';
import {
    getTestPrisma,
    createTestUser,
    cleanupTestData,
    disconnectTestDb
} from '../config/test-db';

// Mock Auth
jest.mock('@/lib/auth', () => ({
    getCurrentUser: jest.fn(),
    requireAuth: jest.fn(),
}));

import * as authModule from '@/lib/auth';
const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;
const mockRequireAuth = authModule.requireAuth as jest.MockedFunction<typeof authModule.requireAuth>;

describe('Integration: Profile Management Flow', () => {
    const prisma = getTestPrisma();
    let testUser: any;

    beforeAll(async () => {
        // Shared cleanup before starting
    });

    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Complete Flow: Brand new user completes profile and adds media', async () => {
        const uniqueId = Date.now().toString();
        testUser = await createTestUser(UserRole.COMEDIAN_VERIFIED, {
            id: `profile-flow-user-${uniqueId}`,
            email: `profile-${uniqueId}@test.com`
        });

        const { POST: updateProfile } = await import('@/app/api/profile/update/route');

        // Setup mock authentication
        mockGetCurrentUser.mockResolvedValue(testUser);
        mockRequireAuth.mockResolvedValue(testUser);

        // 1. Update basic info and professional branding
        const updatePayload = {
            name: "Verified Comedian",
            phone: "9876543210",
            age: 25,
            city: "Hyderabad",
            bio: "Official stage persona bio",
            stageName: "The Mastermind",
            comedianBio: "I breathe comedy.",
            comedianYoutubeUrls: ["https://youtube.com/watch?v=123"],
            comedianInstagramUrls: ["https://instagram.com/reel/abc", "https://instagram.com/reel/def"],
            comedianSocialLinks: {
                youtube: "mastermind_yt",
                instagram: "mastermind_ig"
            }
        };

        const req = new Request('http://localhost:3000/api/profile/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatePayload)
        });

        const res = await updateProfile(req as any);
        expect(res.status).toBe(200);

        // 2. Verify all data persisted correctly in both User and ComedianProfile models
        const dbUser = await prisma.user.findUnique({ where: { id: testUser.id } });
        expect(dbUser?.name).toBe(updatePayload.name);
        expect(dbUser?.phone).toBe(updatePayload.phone);
        expect(dbUser?.city).toBe(updatePayload.city);

        const dbProfile = await prisma.comedianProfile.findUnique({ where: { userId: testUser.id } });
        expect(dbProfile?.stageName).toBe(updatePayload.stageName);
        expect(dbProfile?.youtubeUrls).toContain(updatePayload.comedianYoutubeUrls[0]);
        expect(dbProfile?.instagramUrls).toHaveLength(2);
        expect((dbProfile?.socialLinks as any)?.youtube).toBe(updatePayload.comedianSocialLinks.youtube);

        // 3. Try to EXCEED limits (Worst-case scenario)
        const invalidPayload = {
            ...updatePayload,
            comedianYoutubeUrls: ["url1", "url2"] // Exceeds limit of 1
        };

        const invalidReq = new Request('http://localhost:3000/api/profile/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(invalidPayload)
        });

        const invalidRes = await updateProfile(invalidReq as any);
        expect(invalidRes.status).toBe(400);
        const errorData = await invalidRes.json();
        expect(errorData.error).toContain("Maximum 1 YouTube video");
    });
});
