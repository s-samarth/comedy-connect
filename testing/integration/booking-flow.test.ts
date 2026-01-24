/**
 * Integration Tests: Booking Flow
 * 
 * End-to-end tests for the complete booking workflow
 */

import { UserRole, BookingStatus } from '@prisma/client';
import {
    getTestPrisma,
    createTestUser,
    createTestShow,
    createTestComedian,
    cleanupTestData,
    disconnectTestDb
} from '../config/test-db';

// Mock the auth module
jest.mock('@/lib/auth', () => ({
    getCurrentUser: jest.fn(),
    isVerifiedShowCreator: jest.fn(),
}));

import * as authModule from '@/lib/auth';
import { GET as getShows } from '@/app/api/shows/route';
import { GET as getBookings, POST as createBooking } from '@/app/api/bookings/route';

const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;
const mockIsVerifiedShowCreator = authModule.isVerifiedShowCreator as jest.MockedFunction<typeof authModule.isVerifiedShowCreator>;

describe('Integration: Booking Flow', () => {
    let organizer: { id: string; email: string; role: UserRole };
    let audience: { id: string; email: string; role: UserRole };
    let show: { id: string; title: string };
    let comedian: { id: string; name: string };
    const prisma = getTestPrisma();

    beforeAll(async () => {
        // Setup: Create organizer
        organizer = await createTestUser(UserRole.ORGANIZER_VERIFIED, {
            id: 'test-int-booking-organizer',
            email: 'booking-flow-org@test.com',
        });

        // Setup: Create audience user
        audience = await createTestUser(UserRole.AUDIENCE, {
            id: 'test-int-booking-audience',
            email: 'booking-flow-aud@test.com',
        });

        // Setup: Create comedian
        comedian = await createTestComedian(organizer.id, {
            id: 'test-int-booking-comedian',
            name: 'Integration Test Comedian',
        });

        // Setup: Create show
        show = await createTestShow(organizer.id, {
            id: 'test-int-booking-show',
            title: 'Integration Test Show',
            ticketPrice: 500,
            totalTickets: 50,
            isPublished: true,
        });

        // Link comedian to show
        await prisma.showComedian.create({
            data: {
                id: 'test-int-booking-sc',
                showId: show.id,
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

    describe('Complete Booking Workflow', () => {
        it('Step 1: Guest can browse shows', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const response = await getShows(new Request('http://localhost:3000/api/shows'));

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.shows).toBeDefined();
            expect(Array.isArray(data.shows)).toBe(true);
        });

        it('Step 2: Guest cannot book (unauthorized)', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: show.id, quantity: 2 }),
            });

            const response = await createBooking(request);

            expect(response.status).toBe(401);
        });

        it('Step 3: User signs in and books tickets', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: audience.id,
                email: audience.email,
                role: UserRole.AUDIENCE,
            } as any);

            // Get initial inventory
            const initialInventory = await prisma.ticketInventory.findUnique({
                where: { showId: show.id },
            });
            const initialAvailable = initialInventory?.available || 50;

            // Book tickets
            const quantity = 2;
            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: show.id, quantity }),
            });

            const response = await createBooking(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.booking.quantity).toBe(quantity);

            // Verify inventory decremented
            const updatedInventory = await prisma.ticketInventory.findUnique({
                where: { showId: show.id },
            });
            expect(updatedInventory?.available).toBe(initialAvailable - quantity);
        });

        it('Step 4: User can view their bookings', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: audience.id,
                email: audience.email,
                role: UserRole.AUDIENCE,
            } as any);

            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'GET',
            });

            const response = await getBookings(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.bookings).toBeDefined();
            expect(data.bookings.length).toBeGreaterThanOrEqual(1);

            // Verify booking details
            const booking = data.bookings.find((b: any) =>
                b.showId === show.id || b.show?.id === show.id
            );
            expect(booking).toBeDefined();
            expect(booking.quantity).toBe(2);
        });

        it('Step 5: User CAN book same show again (Robust Booking)', async () => {
            mockGetCurrentUser.mockResolvedValue({
                id: audience.id,
                email: audience.email,
                role: UserRole.AUDIENCE,
            } as any);

            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: show.id, quantity: 1 }),
            });

            const response = await createBooking(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);

            // Verify there are now 2 bookings for this user/show
            const bookings = await prisma.booking.findMany({
                where: { userId: audience.id, showId: show.id }
            });
            expect(bookings.length).toBe(2);
        });
    });

    describe('Inventory Management', () => {
        it('should prevent overbooking when inventory is low', async () => {
            // Create a show with limited inventory
            const limitedShow = await createTestShow(organizer.id, {
                id: 'test-limited-show-' + Date.now(),
                title: 'Limited Show',
                totalTickets: 5,
            });

            // Add comedian
            await prisma.showComedian.create({
                data: {
                    id: 'test-limited-sc-' + Date.now(),
                    showId: limitedShow.id,
                    comedianId: comedian.id,
                    order: 1,
                },
            });

            // Create a fresh user
            const freshUser = await createTestUser(UserRole.AUDIENCE, {
                id: 'test-limited-user-' + Date.now(),
                email: `limited-${Date.now()}@test.com`,
            });

            mockGetCurrentUser.mockResolvedValue({
                id: freshUser.id,
                email: freshUser.email,
                role: UserRole.AUDIENCE,
            } as any);

            // Try to book more than available
            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: limitedShow.id, quantity: 10 }),
            });

            const response = await createBooking(request);

            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.error.toLowerCase()).toMatch(/not enough|maximum/);
        });
    });

    describe('Booking Status Tracking', () => {
        it('should create booking with CONFIRMED_UNPAID status', async () => {
            const newUser = await createTestUser(UserRole.AUDIENCE, {
                id: 'test-status-user-' + Date.now(),
                email: `status-${Date.now()}@test.com`,
            });

            const newShow = await createTestShow(organizer.id, {
                id: 'test-status-show-' + Date.now(),
                title: 'Status Test Show',
                totalTickets: 100,
            });

            await prisma.showComedian.create({
                data: {
                    id: 'test-status-sc-' + Date.now(),
                    showId: newShow.id,
                    comedianId: comedian.id,
                    order: 1,
                },
            });

            mockGetCurrentUser.mockResolvedValue({
                id: newUser.id,
                email: newUser.email,
                role: UserRole.AUDIENCE,
            } as any);

            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: newShow.id, quantity: 1 }),
            });

            const response = await createBooking(request);
            expect(response.status).toBe(200);

            // Verify status in database
            const booking = await prisma.booking.findFirst({
                where: { userId: newUser.id, showId: newShow.id },
            });
            expect(booking?.status).toBe(BookingStatus.CONFIRMED_UNPAID);
        });
    });
});
