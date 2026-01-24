/**
 * Unit Tests: Dashboard API
 * 
 * Tests for /api/organizer/dashboard endpoint
 */

import { UserRole, BookingStatus } from '@prisma/client';
import {
    getTestPrisma,
    createTestUser,
    createTestShow,
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

describe('Dashboard API - /api/organizer/dashboard', () => {
    let testOrganizer: { id: string; email: string; role: UserRole };
    let testComedian: { id: string; email: string; role: UserRole };
    let GET: any;

    beforeAll(async () => {
        // Create test users
        testOrganizer = await createTestUser(UserRole.ORGANIZER_VERIFIED, {
            id: 'test-dashboard-org',
            email: 'dashboard-org@test.com',
        });

        testComedian = await createTestUser(UserRole.COMEDIAN_VERIFIED, {
            id: 'test-dashboard-com',
            email: 'dashboard-com@test.com',
        });

        const module = await import('@/app/api/organizer/dashboard/route');
        GET = module.GET;
    });

    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 for unauthenticated user', async () => {
        mockGetCurrentUser.mockResolvedValue(null);
        const response = await GET();
        expect(response.status).toBe(401);
    });

    it('should return 403 for unauthorized role (AUDIENCE)', async () => {
        const audience = await createTestUser(UserRole.AUDIENCE, {
            id: 'test-dashboard-aud',
            email: 'dashboard-aud@test.com',
        });
        mockGetCurrentUser.mockResolvedValue({
            id: audience.id,
            email: audience.email,
            role: audience.role,
        } as any);

        const response = await GET();
        expect(response.status).toBe(403);
    });

    it('should return accurate statistics for organizer', async () => {
        const prisma = getTestPrisma();

        // 1. Create shows
        const show1 = await createTestShow(testOrganizer.id, {
            id: 'test-dash-show-1',
            title: 'Dash Show 1',
            ticketPrice: 100,
            totalTickets: 10,
            date: new Date(Date.now() + 86400000) // Tomorrow
        });

        const show2 = await createTestShow(testOrganizer.id, {
            id: 'test-dash-show-2',
            title: 'Dash Show 2',
            ticketPrice: 200,
            totalTickets: 5,
            date: new Date(Date.now() - 86400000) // Yesterday
        });

        // 2. Create bookings
        // Show 1: 3 tickets (confirmed)
        await prisma.booking.create({
            data: {
                id: 'test-dash-booking-1',
                showId: show1.id,
                userId: 'test-dashboard-org', // itself or another user
                quantity: 3,
                totalAmount: 300,
                platformFee: 24,
                status: BookingStatus.CONFIRMED,
            }
        });

        // Show 2: 1 ticket (confirmed_unpaid)
        await prisma.booking.create({
            data: {
                id: 'test-dash-booking-2',
                showId: show2.id,
                userId: 'test-dashboard-org',
                quantity: 1,
                totalAmount: 200,
                platformFee: 16,
                status: BookingStatus.CONFIRMED_UNPAID,
            }
        });

        // Show 1: 5 tickets (pending - SHOULD NOT BE COUNTED in stats usually)
        // Wait, our logic counts CONFIRMED and CONFIRMED_UNPAID
        await prisma.booking.create({
            data: {
                id: 'test-dash-booking-3',
                showId: show1.id,
                userId: 'test-dashboard-org',
                quantity: 5,
                totalAmount: 500,
                platformFee: 40,
                status: BookingStatus.PENDING,
            }
        });

        mockGetCurrentUser.mockResolvedValue({
            id: testOrganizer.id,
            email: testOrganizer.email,
            role: testOrganizer.role,
        } as any);

        const response = await GET();
        expect(response.status).toBe(200);

        const data = await response.json();

        expect(data.totalShows).toBe(2);
        expect(data.upcomingShows).toBe(1);
        expect(data.ticketsSold).toBe(4); // 3 (show1) + 1 (show2)
        expect(data.totalRevenue).toBe(500); // 300 + 200

        expect(data.upcomingShowsList.length).toBe(1);
        expect(data.upcomingShowsList[0].id).toBe(show1.id);
        expect(data.upcomingShowsList[0].ticketsSold).toBe(3);
        expect(data.upcomingShowsList[0].revenue).toBe(300);
    });

    it('should return accurate statistics for comedian', async () => {
        const prisma = getTestPrisma();

        // 1. Create show
        const show = await createTestShow(testComedian.id, {
            id: 'test-dash-com-show',
            title: 'Comedian Dash Show',
            ticketPrice: 50,
            totalTickets: 20
        });

        // 2. Create booking
        await prisma.booking.create({
            data: {
                id: 'test-dash-com-booking',
                showId: show.id,
                userId: testComedian.id,
                quantity: 2,
                totalAmount: 100,
                platformFee: 8,
                status: BookingStatus.CONFIRMED,
            }
        });

        mockGetCurrentUser.mockResolvedValue({
            id: testComedian.id,
            email: testComedian.email,
            role: testComedian.role,
        } as any);

        const response = await GET();
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.totalShows).toBe(1);
        expect(data.ticketsSold).toBe(2);
        expect(data.totalRevenue).toBe(100);
    });
});
