/**
 * Unit Tests: Bookings API
 * 
 * Tests for /api/bookings endpoints
 */

import { UserRole, BookingStatus } from '@prisma/client';
import {
    getTestPrisma,
    createTestUser,
    createTestShow,
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
import { GET, POST } from '@/app/api/bookings/route';

const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;

describe('Bookings API - /api/bookings', () => {
    let testUser: { id: string; email: string; role: UserRole };
    let testOrganizer: { id: string; email: string; role: UserRole };
    let testShow: { id: string; title: string };

    beforeAll(async () => {
        // Create test users
        testUser = await createTestUser(UserRole.AUDIENCE, {
            id: 'test-bookings-user',
            email: 'bookings-user@test.com',
        });

        testOrganizer = await createTestUser(UserRole.ORGANIZER_VERIFIED, {
            id: 'test-bookings-organizer',
            email: 'bookings-organizer@test.com',
        });

        // Create a comedian for the show
        const comedian = await createTestComedian(testOrganizer.id, {
            id: 'test-bookings-comedian',
            name: 'Bookings Test Comedian',
        });

        // Create test show with inventory
        testShow = await createTestShow(testOrganizer.id, {
            id: 'test-bookings-show',
            title: 'Bookings Test Show',
            ticketPrice: 500,
            totalTickets: 100,
        });

        // Link comedian to show (required for booking)
        const prisma = getTestPrisma();
        await prisma.showComedian.create({
            data: {
                id: 'test-bookings-sc',
                showId: testShow.id,
                comedianId: comedian.id,
                order: 1,
            },
        });
    });

    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/bookings', () => {
        it('should return 401 for unauthenticated user', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'GET',
            });

            const response = await GET(request);

            expect(response.status).toBe(401);
            const data = await response.json();
            expect(data.error).toBe('Unauthorized');
        });

        it('should return empty bookings array for user with no bookings', async () => {
            const newUser = await createTestUser(UserRole.AUDIENCE, {
                id: 'test-no-bookings-user',
                email: 'no-bookings@test.com',
            });

            mockGetCurrentUser.mockResolvedValue({
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            } as any);

            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'GET',
            });

            const response = await GET(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.bookings).toEqual([]);
        });

        it('should return user bookings for authenticated user', async () => {
            // Create a booking first
            const prisma = getTestPrisma();
            await prisma.booking.create({
                data: {
                    id: 'test-booking-get',
                    showId: testShow.id,
                    userId: testUser.id,
                    quantity: 2,
                    totalAmount: 1000,
                    platformFee: 80,
                    status: BookingStatus.CONFIRMED_UNPAID,
                },
            });

            mockGetCurrentUser.mockResolvedValue({
                id: testUser.id,
                email: testUser.email,
                role: testUser.role,
            } as any);

            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'GET',
            });

            const response = await GET(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.bookings.length).toBeGreaterThanOrEqual(1);
        });

        it('should filter bookings by showId when provided', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testUser.id,
                email: testUser.email,
                role: testUser.role,
            } as any);

            const request = new Request(`http://localhost:3000/api/bookings?showId=${testShow.id}`, {
                method: 'GET',
            });

            const response = await GET(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            if (data.bookings.length > 0) {
                expect(data.bookings.every((b: any) => b.showId === testShow.id || b.show?.id === testShow.id)).toBe(true);
            }
        });
    });

    describe('POST /api/bookings', () => {
        it('should return 401 for unauthenticated user', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: testShow.id, quantity: 2 }),
            });

            const response = await POST(request);

            expect(response.status).toBe(401);
        });

        it('should return 400 when showId is missing', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testUser.id,
                email: testUser.email,
                role: testUser.role,
            } as any);

            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: 2 }),
            });

            const response = await POST(request);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error).toBeTruthy();
        });

        it('should return 400 when quantity is missing or invalid', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testUser.id,
                email: testUser.email,
                role: testUser.role,
            } as any);

            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: testShow.id }),
            });

            const response = await POST(request);

            expect(response.status).toBe(400);
        });

        it('should return 400 when quantity exceeds maximum (10)', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testUser.id,
                email: testUser.email,
                role: testUser.role,
            } as any);

            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: testShow.id, quantity: 15 }),
            });

            const response = await POST(request);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error.toLowerCase()).toContain('maximum');
        });

        it('should return 400 for non-existent show', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: testUser.id,
                email: testUser.email,
                role: testUser.role,
            } as any);

            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: 'non-existent-show-id', quantity: 2 }),
            });

            const response = await POST(request);

            expect(response.status).toBe(400);
        });

        it('should create booking and decrement inventory for valid request', async () => {
            // Create a fresh user to avoid duplicate booking error
            const freshUser = await createTestUser(UserRole.AUDIENCE, {
                id: 'test-fresh-booking-user-' + Date.now(),
                email: `fresh-${Date.now()}@test.com`,
            });

            // Create a fresh show for this test
            const freshShow = await createTestShow(testOrganizer.id, {
                id: 'test-fresh-show-' + Date.now(),
                title: 'Fresh Test Show',
                ticketPrice: 500,
                totalTickets: 50,
            });

            // Add comedian to make it bookable
            const comedian = await createTestComedian(testOrganizer.id, {
                id: 'test-fresh-comedian-' + Date.now(),
                name: 'Fresh Comedian',
            });

            const prisma = getTestPrisma();
            await prisma.showComedian.create({
                data: {
                    id: 'test-fresh-sc-' + Date.now(),
                    showId: freshShow.id,
                    comedianId: comedian.id,
                    order: 1,
                },
            });

            // Get initial inventory
            const initialInventory = await prisma.ticketInventory.findUnique({
                where: { showId: freshShow.id },
            });

            mockGetCurrentUser.mockResolvedValue({
                id: freshUser.id,
                email: freshUser.email,
                role: freshUser.role,
            } as any);

            const quantity = 3;
            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: freshShow.id, quantity }),
            });

            const response = await POST(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.booking).toBeTruthy();
            expect(data.booking.quantity).toBe(quantity);

            // Verify inventory was decremented
            const updatedInventory = await prisma.ticketInventory.findUnique({
                where: { showId: freshShow.id },
            });
            expect(updatedInventory?.available).toBe((initialInventory?.available || 50) - quantity);
        });

        it('should allow multiple bookings for same user and show', async () => {
            // Create user and show for multi-booking test
            const multiUser = await createTestUser(UserRole.AUDIENCE, {
                id: 'test-multi-user-' + Date.now(),
                email: `multi-${Date.now()}@test.com`,
            });

            const multiShow = await createTestShow(testOrganizer.id, {
                id: 'test-multi-show-' + Date.now(),
                title: 'Multi Test Show',
                totalTickets: 100,
            });

            // Add comedian
            const comedian = await createTestComedian(testOrganizer.id, {
                id: 'test-multi-comedian-' + Date.now(),
                name: 'Multi Comedian',
            });

            const prisma = getTestPrisma();
            await prisma.showComedian.create({
                data: {
                    id: 'test-multi-sc-' + Date.now(),
                    showId: multiShow.id,
                    comedianId: comedian.id,
                    order: 1,
                },
            });

            mockGetCurrentUser.mockResolvedValue({
                id: multiUser.id,
                email: multiUser.email,
                role: multiUser.role,
            } as any);

            // First booking should succeed
            const request1 = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: multiShow.id, quantity: 2 }),
            });

            const response1 = await POST(request1);
            expect(response1.status).toBe(200);

            // Second booking should also succeed now
            const request2 = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: multiShow.id, quantity: 1 }),
            });

            const response2 = await POST(request2);
            expect(response2.status).toBe(200);
            const data = await response2.json();
            expect(data.success).toBe(true);

            // Verify there are 2 bookings in DB
            const bookings = await prisma.booking.findMany({
                where: { userId: multiUser.id, showId: multiShow.id }
            });
            expect(bookings.length).toBe(2);
        });
    });
});
