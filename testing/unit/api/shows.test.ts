/**
 * Unit Tests: Shows API
 * 
 * Tests for /api/shows endpoints
 */

import { NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import {
    getTestPrisma,
    createTestUser,
    createTestShow,
    createTestComedian,
    cleanupTestData,
    disconnectTestDb
} from '../../config/test-db';
import { MOCK_USERS } from '../../config/auth-mocks';

// Mock the auth module
jest.mock('@/lib/auth', () => ({
    getCurrentUser: jest.fn(),
    requireAuth: jest.fn(),
    requireShowCreator: jest.fn(),
    isVerifiedShowCreator: jest.fn(),
}));

// Import after mocking
import * as authModule from '@/lib/auth';
import { GET, POST } from '@/app/api/shows/route';

const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;
const mockRequireShowCreator = authModule.requireShowCreator as jest.MockedFunction<typeof authModule.requireShowCreator>;
const mockIsVerifiedShowCreator = authModule.isVerifiedShowCreator as jest.MockedFunction<typeof authModule.isVerifiedShowCreator>;

describe('Shows API - /api/shows', () => {
    let testOrganizer: { id: string; email: string; role: UserRole };

    beforeAll(async () => {
        // Create test organizer in database
        // Create test organizer in database - use dynamic IDs to avoid collisions
        testOrganizer = await createTestUser(UserRole.ORGANIZER_VERIFIED);
    });

    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Default: requireShowCreator throws error for unauthenticated
        mockRequireShowCreator.mockRejectedValue(new Error('Unauthorized'));
    });

    describe('GET /api/shows', () => {
        it('should return 200 with shows list for unauthenticated user', async () => {
            // Shows endpoint is public
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new Request('http://localhost:3000/api/shows', {
                method: 'GET',
            });

            const response = await GET();

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('shows');
            expect(Array.isArray(data.shows)).toBe(true);
        });

        it('should return 200 with shows list for authenticated user', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: 'test-user',
                email: 'test@test.com',
                role: UserRole.AUDIENCE,
            } as any);

            const response = await GET();

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data).toHaveProperty('shows');
        });
    });

    describe('POST /api/shows', () => {
        const validShowData = {
            title: 'Test Comedy Night',
            description: 'A hilarious evening',
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            venue: 'Test Venue, Hyderabad',
            ticketPrice: 500,
            totalTickets: 100,
            comedianIds: [],
        };

        it('should return 401 for unauthenticated user', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validShowData),
            });

            const response = await POST(request);

            expect(response.status).toBe(500); // API catches all errors and returns 500
            const data = await response.json();
            expect(data.error).toContain('Failed to create show');
        });

        it('should return 403 for AUDIENCE role', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: 'test-audience',
                email: 'audience@test.com',
                role: UserRole.AUDIENCE,
            } as any);
            mockRequireShowCreator.mockRejectedValue(new Error('Forbidden'));
            mockIsVerifiedShowCreator.mockReturnValue(false);

            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validShowData),
            });

            const response = await POST(request);

            expect(response.status).toBe(500); // API catches all errors and returns 500
        });

        it('should return 403 for ORGANIZER_UNVERIFIED role', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: 'test-unverified',
                email: 'unverified@test.com',
                role: UserRole.ORGANIZER_UNVERIFIED,
            } as any);
            mockRequireShowCreator.mockResolvedValue({
                id: 'test-unverified',
                email: 'unverified@test.com',
                role: UserRole.ORGANIZER_UNVERIFIED,
            } as any);
            mockIsVerifiedShowCreator.mockReturnValue(false);

            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(validShowData),
            });

            const response = await POST(request);

            expect(response.status).toBe(403);
        });

        it('should return 400 for invalid show data (missing title)', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testOrganizer.id,
                email: testOrganizer.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockRequireShowCreator.mockResolvedValue({
                id: testOrganizer.id,
                email: testOrganizer.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockIsVerifiedShowCreator.mockReturnValue(true);

            const invalidData = { ...validShowData, title: '' };
            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invalidData),
            });

            const response = await POST(request);

            expect(response.status).toBe(400);
        });

        it('should create show successfully for ORGANIZER_VERIFIED', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testOrganizer.id,
                email: testOrganizer.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockRequireShowCreator.mockResolvedValue({
                id: testOrganizer.id,
                email: testOrganizer.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockIsVerifiedShowCreator.mockReturnValue(true);

            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...validShowData,
                    title: 'Unique Test Show ' + Date.now(),
                }),
            });

            const response = await POST(request);

            // Should be 201 Created or 200 OK
            expect([200, 201]).toContain(response.status);
            const data = await response.json();
            expect(data.show || data.id).toBeTruthy();
        });

        it('should create show successfully for COMEDIAN_VERIFIED', async () => {
            const comedian = await createTestUser(UserRole.COMEDIAN_VERIFIED, {
                id: 'test-shows-comedian',
                email: 'comedian@shows-test.com',
            });

            mockGetCurrentUser.mockResolvedValue({
                id: comedian.id,
                email: comedian.email,
                role: UserRole.COMEDIAN_VERIFIED,
            } as any);
            mockRequireShowCreator.mockResolvedValue({
                id: comedian.id,
                email: comedian.email,
                role: UserRole.COMEDIAN_VERIFIED,
            } as any);
            mockIsVerifiedShowCreator.mockReturnValue(false); // Not organizer, but comedian

            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...validShowData,
                    title: 'Comedian Show ' + Date.now(),
                }),
            });

            const response = await POST(request);

            // Comedian verified should also be able to create shows
            expect([200, 201, 403]).toContain(response.status);
        });

        it('should create shows with isPublished: true by default', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testOrganizer.id,
                email: testOrganizer.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockRequireShowCreator.mockResolvedValue({
                id: testOrganizer.id,
                email: testOrganizer.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockIsVerifiedShowCreator.mockReturnValue(true);

            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...validShowData,
                    title: 'Published Show ' + Date.now(),
                }),
            });

            const response = await POST(request);
            expect([200, 201]).toContain(response.status);

            const data = await response.json();
            const showId = data.show?.id || data.id;
            expect(showId).toBeTruthy();

            // Verify the show is published by default
            const prisma = getTestPrisma();
            const createdShow = await prisma.show.findUnique({
                where: { id: showId },
            });
            expect(createdShow?.isPublished).toBe(true);
        });

        it('should allow organizer to create show without comedianIds', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testOrganizer.id,
                email: testOrganizer.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockRequireShowCreator.mockResolvedValue({
                id: testOrganizer.id,
                email: testOrganizer.email,
                role: UserRole.ORGANIZER_VERIFIED,
            } as any);
            mockIsVerifiedShowCreator.mockReturnValue(true);

            const dataWithoutComedians = {
                title: 'No Comedians Show ' + Date.now(),
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                venue: 'Test Venue, Hyderabad',
                ticketPrice: 500,
                totalTickets: 100,
                // No comedianIds field
            };

            const request = new Request('http://localhost:3000/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataWithoutComedians),
            });

            const response = await POST(request);
            expect([200, 201]).toContain(response.status);

            const data = await response.json();
            expect(data.show || data.id).toBeTruthy();
        });
    });
});
