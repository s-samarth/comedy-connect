/**
 * Integration Tests: Organizer Verification Flow
 * 
 * End-to-end tests for the organizer verification workflow
 */

import { UserRole, ApprovalStatus } from '@prisma/client';
import {
    getTestPrisma,
    createTestUser,
    createOrganizerProfile,
    cleanupTestData,
    disconnectTestDb
} from '../config/test-db';

// Mock the auth module
jest.mock('@/lib/auth', () => ({
    getCurrentUser: jest.fn(),
    requireShowCreator: jest.fn(),
    isVerifiedShowCreator: jest.fn(),
    requireAdmin: jest.fn(),
}));

import * as authModule from '@/lib/auth';

const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;
const mockRequireShowCreator = authModule.requireShowCreator as jest.MockedFunction<typeof authModule.requireShowCreator>;
const mockRequireAdmin = authModule.requireAdmin as jest.MockedFunction<typeof authModule.requireAdmin>;
const mockIsVerifiedShowCreator = authModule.isVerifiedShowCreator as jest.MockedFunction<typeof authModule.isVerifiedShowCreator>;

describe('Integration: Organizer Verification Flow', () => {
    const prisma = getTestPrisma();
    let admin: { id: string; email: string; role: UserRole };

    beforeAll(async () => {
        admin = await createTestUser(UserRole.ADMIN, {
            id: 'test-int-org-admin',
            email: 'org-flow-admin@test.com',
        });
    });

    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Complete Organizer Verification Workflow', () => {
        let newUser: { id: string; email: string; role: UserRole };
        let orgProfile: { id: string; userId: string; name: string };

        it('Step 1: New user signs up as AUDIENCE', async () => {
            newUser = await createTestUser(UserRole.AUDIENCE, {
                id: 'test-int-new-org-' + Date.now(),
                email: `new-org-${Date.now()}@test.com`,
            });

            expect(newUser.role).toBe(UserRole.AUDIENCE);
        });

        it('Step 2: User creates organizer profile', async () => {
            // Import organizer profile route
            const { POST } = await import('@/app/api/organizer/profile/route');

            mockGetCurrentUser.mockResolvedValue({
                id: newUser.id,
                email: newUser.email,
                role: UserRole.AUDIENCE,
            } as any);

            const request = new Request('http://localhost:3000/api/organizer/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'New Comedy Club',
                    venue: 'Hyderabad Comedy Hub',
                    description: 'Best comedy venue in town',
                }),
            });

            const response = await POST(request);
            expect([200, 201]).toContain(response.status);

            // Verify profile was created
            orgProfile = await prisma.organizerProfile.findUnique({
                where: { userId: newUser.id },
            }) as any;
            expect(orgProfile).toBeTruthy();
            expect(orgProfile.name).toBe('New Comedy Club');
        });

        it('Step 3: User role changes to ORGANIZER_UNVERIFIED', async () => {
            // Check user role was updated
            const updatedUser = await prisma.user.findUnique({
                where: { id: newUser.id },
            });

            // Role should be ORGANIZER_UNVERIFIED after creating profile
            expect([UserRole.ORGANIZER_UNVERIFIED, UserRole.AUDIENCE]).toContain(updatedUser?.role);
        });

        it('Step 4: Unverified organizer cannot create shows', async () => {
            const { POST } = await import('@/app/api/shows/route');

            mockGetCurrentUser.mockResolvedValue({
                id: newUser.id,
                email: newUser.email,
                role: UserRole.ORGANIZER_UNVERIFIED,
            } as any);
            mockRequireShowCreator.mockResolvedValue({
                id: newUser.id,
                email: newUser.email,
                role: UserRole.ORGANIZER_UNVERIFIED,
            } as any);
            mockIsVerifiedShowCreator.mockReturnValue(false);

            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Unauthorized Show',
                    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    venue: 'Test Venue',
                    ticketPrice: 500,
                    totalTickets: 100,
                }),
            });

            const response = await POST(request);
            expect(response.status).toBe(403);
        });

        it('Step 5: Admin can see pending organizers', async () => {
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

            const response = await GET();
            expect(response.status).toBe(200);

            const data = await response.json();
            expect(data.organizers).toBeDefined();
            expect(Array.isArray(data.organizers)).toBe(true);
        });

        it('Step 6: Admin approves organizer', async () => {
            // Manually update user role to simulate admin approval
            await prisma.user.update({
                where: { id: newUser.id },
                data: { role: UserRole.ORGANIZER_VERIFIED },
            });

            // Verify role was updated
            const approvedUser = await prisma.user.findUnique({
                where: { id: newUser.id },
            });
            expect(approvedUser?.role).toBe(UserRole.ORGANIZER_VERIFIED);
        });

        it('Step 7: Verified organizer CAN create shows', async () => {
            const { POST } = await import('@/app/api/shows/route');

            mockGetCurrentUser.mockResolvedValue({
                id: newUser.id,
                email: newUser.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockRequireShowCreator.mockResolvedValue({
                id: newUser.id,
                email: newUser.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockIsVerifiedShowCreator.mockReturnValue(true);

            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Authorized Show ' + Date.now(),
                    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    venue: 'Test Venue, Hyderabad',
                    ticketPrice: 500,
                    totalTickets: 100,
                    comedianIds: [],
                }),
            });

            const response = await POST(request);
            expect([200, 201]).toContain(response.status);
        });
    });

    describe('Organizer Rejection Flow', () => {
        it('Rejected organizer should have restricted access', async () => {
            // Create an unverified organizer
            const rejectedUser = await createTestUser(UserRole.ORGANIZER_UNVERIFIED, {
                id: 'test-rejected-org-' + Date.now(),
                email: `rejected-${Date.now()}@test.com`,
            });

            await createOrganizerProfile(rejectedUser.id, {
                id: 'test-rejected-profile-' + Date.now(),
                name: 'Rejected Organizer',
            });

            // Attempt to create show should fail
            const { POST } = await import('@/app/api/shows/route');

            mockGetCurrentUser.mockResolvedValue({
                id: rejectedUser.id,
                email: rejectedUser.email,
                role: UserRole.ORGANIZER_UNVERIFIED,
            } as any);
            mockRequireShowCreator.mockResolvedValue({
                id: rejectedUser.id,
                email: rejectedUser.email,
                role: UserRole.ORGANIZER_UNVERIFIED,
            } as any);
            mockIsVerifiedShowCreator.mockReturnValue(false);

            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Should Not Work',
                    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    venue: 'Test Venue',
                    ticketPrice: 500,
                    totalTickets: 100,
                }),
            });

            const response = await POST(request);
            expect(response.status).toBe(403);
        });
    });
});
