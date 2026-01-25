
/**
 * User Flow Tests based on userflows/README.md
 * 
 * This suite verifies the three core flows:
 * 1. Audience Flow
 * 2. Onboarding Flow (Unverified -> Verified)
 * 3. Creator Flow (Draft -> Publish lifecycle)
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
    requireShowCreator: jest.fn(),
    isVerifiedShowCreator: jest.fn(),
    requireAdmin: jest.fn(),
    requireAuth: jest.fn(),
}));

// Mock Next.js headers/cookies
jest.mock('next/headers', () => ({
    cookies: () => ({
        get: jest.fn(),
    }),
    headers: () => ({
        get: jest.fn(),
    }),
}));

// Mock next-auth
jest.mock('next-auth/next', () => ({
    getServerSession: jest.fn(),
}));

// Mock Next.js cache/revalidation to avoid "headers" error
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

import * as authModule from '@/lib/auth';
const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;
const mockRequireShowCreator = authModule.requireShowCreator as jest.MockedFunction<typeof authModule.requireShowCreator>;
const mockIsVerifiedShowCreator = authModule.isVerifiedShowCreator as jest.MockedFunction<typeof authModule.isVerifiedShowCreator>;
const mockRequireAuth = authModule.requireAuth as jest.MockedFunction<typeof authModule.requireAuth>;

describe('FULL USER FLOW VERIFICATION', () => {
    const prisma = getTestPrisma();

    beforeAll(async () => {
        // Ensure clean state
    });

    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // =========================================================================
    // FLOW 1: AUDIENCE USER FLOW
    // =========================================================================
    describe('1. Audience User Flow (Browse -> Book)', () => {
        let publishedShowId: string;
        let audienceUser: any;

        beforeAll(async () => {
            const uniqueId = Date.now() + '1';
            // Setup: Create a published show exists to be browsed
            const creator = await createTestUser(UserRole.ORGANIZER_VERIFIED, {
                id: `flow1-creator-${uniqueId}`,
                email: `flow1-c-${uniqueId}@test.com`
            });

            // Create a dummy comedian for the show
            const comedianUser = await createTestUser(UserRole.COMEDIAN_VERIFIED, {
                id: `flow1-comedian-${uniqueId}`,
                email: `comedian-${uniqueId}@test.com`
            });
            const comedianProfile = await prisma.comedian.create({
                data: {
                    name: "Funny Guy",
                    bio: "Standard Bio",
                    createdBy: comedianUser.id,
                }
            });

            const show = await prisma.show.create({
                data: {
                    title: 'Audience Flow Show',
                    description: 'Test Description',
                    date: new Date(Date.now() + 86400000), // Tomorrow
                    venue: 'Hyderabad Venue',
                    ticketPrice: 500,
                    totalTickets: 50,
                    isPublished: true, // IMPORTANT: Must be published to be visible
                    createdBy: creator.id,
                    ticketInventory: {
                        create: { available: 50 }
                    },
                    showComedians: {
                        create: {
                            comedianId: comedianProfile.id,
                            order: 0
                        }
                    }
                } as any
            });
            publishedShowId = show.id;

            audienceUser = await createTestUser(UserRole.AUDIENCE, {
                id: `flow1-audience-${uniqueId}`,
                email: `audience-${uniqueId}@test.com`
            });
        });

        it('Browsing: Can view list of shows without login', async () => {
            const { GET } = await import('@/app/api/shows/route');
            mockGetCurrentUser.mockResolvedValue(null); // No user logged in

            const res = await GET(new Request('http://localhost:3000/api/shows?mode=discovery'));
            expect(res.status).toBe(200);

            const data = await res.json();
            const targetShow = data.shows.find((s: any) => s.id === publishedShowId);
            expect(targetShow).toBeDefined();
            expect(targetShow.title).toBe('Audience Flow Show');
        });

        it('Booking: Should fail/redirect if not logged in (Simulated)', async () => {
            // In a real Booking API test, we expect a 401 or error if auth is missing
            const { POST } = await import('@/app/api/bookings/route');
            mockGetCurrentUser.mockResolvedValue(null);

            const req = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                body: JSON.stringify({ showId: publishedShowId, quantity: 2 })
            });

            // The actual route uses getServerSession, which we mocked via getCurrentUser in our code logic (usually)
            // But let's check how the booking route verifies headers.
            // If it uses requireAuth, it throws error.
            mockRequireAuth.mockRejectedValue(new Error('Authentication required'));

            const response = await POST(req);
            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Unauthorized');
        });

        it('Booking: Successful booking after Login', async () => {
            const { POST } = await import('@/app/api/bookings/route');

            // Login matches
            mockGetCurrentUser.mockResolvedValue(audienceUser);
            mockRequireAuth.mockResolvedValue(audienceUser);

            const req = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: publishedShowId, quantity: 2 })
            });

            const response = await POST(req);
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.booking.status).toBe('CONFIRMED_UNPAID');
        });
    });

    // =========================================================================
    // FLOW 2: ONBOARDING FLOW (Unverified -> Verified)
    // =========================================================================
    describe('2. Onboarding Flow (Role Upgrade)', () => {
        let newUser: any;

        it('Initial Auth: Standard user created', async () => {
            const uniqueId = Date.now() + '2';
            newUser = await createTestUser(UserRole.AUDIENCE, {
                id: `flow2-newuser-${uniqueId}`,
                email: `flow2-${uniqueId}@test.com`
            });
            expect(newUser.role).toBe(UserRole.AUDIENCE);
        });

        it('Role Selection: User submits Organizer Profile', async () => {
            const { POST } = await import('@/app/api/organizer/profile/route');

            mockGetCurrentUser.mockResolvedValue(newUser);
            mockRequireAuth.mockResolvedValue(newUser);

            const req = new Request('http://localhost:3000/api/organizer/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'New Comedy Club',
                    venue: 'Hyderabad Hub',
                    description: 'Cool Place'
                })
            });

            const res = await POST(req);
            expect([200, 201]).toContain(res.status);

            // Verify DB Update
            const updatedUser = await prisma.user.findUnique({ where: { id: newUser.id } });
            expect(updatedUser?.role).toBe(UserRole.ORGANIZER_UNVERIFIED);
        });

        it('Verification State: Unverified User CANNOT create shows', async () => {
            const { POST } = await import('@/app/api/shows/route');

            // Mock auth returning the unverified user
            const unverifiedUser = { ...newUser, role: UserRole.ORGANIZER_UNVERIFIED };
            mockRequireShowCreator.mockResolvedValue(unverifiedUser);
            mockIsVerifiedShowCreator.mockReturnValue(false); // Helper returns false

            const req = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                body: JSON.stringify({
                    title: 'Illegal Show',
                    date: new Date().toISOString(),
                    venue: 'Hyd',
                    googleMapsLink: 'https://maps.google.com/test',
                    ticketPrice: 100,
                    totalTickets: 10
                })
            });

            const res = await POST(req);
            expect(res.status).toBe(403); // Forbidden
        });

        it('Admin Approval: Admin verifies user', async () => {
            // Direct DB update to simulate Admin Action
            await prisma.user.update({
                where: { id: newUser.id },
                data: { role: UserRole.ORGANIZER_VERIFIED }
            });

            const verifiedUser = await prisma.user.findUnique({ where: { id: newUser.id } });
            expect(verifiedUser?.role).toBe(UserRole.ORGANIZER_VERIFIED);
        });
    });

    // =========================================================================
    // FLOW 3: CREATOR FLOW (Draft -> Publish)
    // =========================================================================
    describe('3. Creator Flow (Draft/Publish Lifecycle)', () => {
        let creator: any;
        let showId: string;

        beforeAll(async () => {
            const uniqueId = Date.now().toString();
            creator = await createTestUser(UserRole.ORGANIZER_VERIFIED, {
                id: `flow3-creator-${uniqueId}`,
                email: `flow3-${uniqueId}@test.com`
            });
        });

        it('Show Creation: Creates as DRAFT by default', async () => {
            const { POST } = await import('@/app/api/shows/route');

            mockRequireShowCreator.mockResolvedValue(creator);
            mockIsVerifiedShowCreator.mockReturnValue(true);

            const req = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Draft Lifecycle Show',
                    description: 'Testing lifecycle',
                    date: new Date(Date.now() + 10000000).toISOString(),
                    venue: 'Hyderabad Lab',
                    googleMapsLink: 'https://maps.google.com/test',
                    ticketPrice: 200,
                    totalTickets: 20
                })
            });

            const res = await POST(req);
            expect(res.status).toBe(200);
            const data = await res.json();

            showId = data.show.id;
            expect(data.show.isPublished).toBe(false); // Key assertion
        });

        it('Draft Visibility: Audience CANNOT see draft show', async () => {
            const { GET } = await import('@/app/api/shows/route');

            // Simulate Audience
            mockGetCurrentUser.mockResolvedValue({ role: UserRole.AUDIENCE } as any);

            // Use discovery mode
            const req = new Request('http://localhost:3000/api/shows?mode=discovery');
            const res = await GET(req);
            const data = await res.json();
            const found = data.shows.find((s: any) => s.id === showId);

            expect(found).toBeUndefined(); // Should not be in the list
        });

        it('Publish: Creator publishes the show', async () => {
            // Need to import the dynamic route handler for publish
            // We'll mock the next request process
            const { POST } = await import('@/app/api/shows/[id]/publish/route');

            mockGetCurrentUser.mockResolvedValue(creator);

            const req = new Request(`http://localhost:3000/api/shows/${showId}/publish`, { method: 'POST' });

            // Note: params is a promise in Next 15+
            const params = Promise.resolve({ id: showId });

            const res = await POST(req, { params });
            expect(res.status).toBe(200);

            const dbShow = await prisma.show.findUnique({ where: { id: showId } });
            expect(dbShow?.isPublished).toBe(true);
        });

        it('Public Visibility: Audience CAN see published show', async () => {
            const { GET } = await import('@/app/api/shows/route');

            mockGetCurrentUser.mockResolvedValue({ role: UserRole.AUDIENCE } as any);

            // Mock request with mode=discovery
            const req = new Request('http://localhost:3000/api/shows?mode=discovery');

            const res = await GET(req);
            const data = await res.json();
            const found = data.shows.find((s: any) => s.id === showId);

            expect(found).toBeDefined();
        });

        // Unpublish removed per requirement
        /*
        it('Unpublish: Creator unpublishes the show', async () => {
            const { POST } = await import('@/app/api/shows/[id]/unpublish/route');
            
            mockGetCurrentUser.mockResolvedValue(creator);

            const req = new Request(`http://localhost:3000/api/shows/${showId}/unpublish`, { method: 'POST' });
            const params = Promise.resolve({ id: showId });

            const res = await POST(req, { params });
            if (res.status !== 200) {
                 const d = await res.json();
                 console.error('UNPUBLISH ERROR:', d);
            }
            expect(res.status).toBe(200);

            const dbShow = await prisma.show.findUnique({ where: { id: showId } });
            expect(dbShow?.isPublished).toBe(false);
        });
        */
    });

});
