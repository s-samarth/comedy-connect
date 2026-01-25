/**
 * Unit Tests: Admin Collections API
 * 
 * Tests for /api/admin/collections endpoint
 */

import { UserRole } from '@prisma/client';
import { NextRequest } from 'next/server';
import {
    getTestPrisma,
    createTestUser,
    createTestShow,
    cleanupTestData,
    disconnectTestDb
} from '../../config/test-db';

// Mock the auth module
jest.mock('@/lib/auth', () => ({
    requireAdmin: jest.fn(),
}));

import * as authModule from '@/lib/auth';
const mockRequireAdmin = authModule.requireAdmin as jest.MockedFunction<typeof authModule.requireAdmin>;

describe('Admin Collections API - /api/admin/collections', () => {
    let testAdmin: { id: string; email: string; role: UserRole };
    let testShow: any;
    let GET: any;

    beforeAll(async () => {
        const prisma = getTestPrisma();

        // Create test admin
        testAdmin = await createTestUser(UserRole.ADMIN, {
            id: 'test-admin-coll-admin',
            email: 'admin-coll@test.com',
        });

        // Create a test show
        testShow = await createTestShow(testAdmin.id, {
            id: 'test-coll-show-1',
            title: 'Collections Test Show',
            ticketPrice: 1000,
            isPublished: true
        });

        // Create some bookings for calculations
        await prisma.booking.create({
            data: {
                id: 'test-coll-booking-1',
                showId: testShow.id,
                userId: testAdmin.id,
                quantity: 2,
                totalAmount: 2000,
                platformFee: 160, // 8% of 2000
                bookingFee: 30,
                status: 'CONFIRMED'
            }
        });

        const module = await import('@/app/api/admin/collections/route');
        GET = module.GET;
    });

    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 401 if not an admin', async () => {
        mockRequireAdmin.mockRejectedValue(new Error('Authentication required'));
        const request = new NextRequest('http://localhost:3000/api/admin/collections');
        const response = await GET(request);
        expect(response.status).toBe(401);
    });

    it('should return simplified data with Earnings terminology', async () => {
        mockRequireAdmin.mockResolvedValue({ id: testAdmin.id } as any);

        const request = new NextRequest('http://localhost:3000/api/admin/collections');
        const response = await GET(request);
        expect(response.status).toBe(200);

        const data = await response.json();

        // Check structure
        expect(data).toHaveProperty('lifetime');
        expect(data.lifetime).toHaveProperty('showEarnings'); // New terminology
        expect(data.lifetime).toHaveProperty('platformEarnings'); // New terminology
        expect(data.lifetime.shows[0].stats).toHaveProperty('showEarnings');
        expect(data.lifetime.shows[0].stats).toHaveProperty('platformEarnings');

        // Check math
        // Revenue: 2000
        // Platform Fee (Commission): 160
        // Booking Fee: 30
        // platformEarnings = 160 + 30 = 190
        // showEarnings = 2000 - 160 = 1840
        const show = data.lifetime.shows.find((s: any) => s.id === testShow.id);
        expect(show.stats.platformEarnings).toBe(190);
        expect(show.stats.showEarnings).toBe(1840);
    });

    it('should filter by showId correctly', async () => {
        mockRequireAdmin.mockResolvedValue({ id: testAdmin.id } as any);

        const request = new NextRequest(`http://localhost:3000/api/admin/collections?showId=${testShow.id}`);
        const response = await GET(request);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.lifetime.shows.length).toBe(1);
        expect(data.lifetime.shows[0].id).toBe(testShow.id);
    });

    it('should return 200 even for shows with zero revenue when showId is provided', async () => {
        mockRequireAdmin.mockResolvedValue({ id: testAdmin.id } as any);

        const emptyShow = await createTestShow(testAdmin.id, {
            id: 'test-empty-show',
            title: 'Empty Show',
            isPublished: true
        });

        const request = new NextRequest(`http://localhost:3000/api/admin/collections?showId=${emptyShow.id}`);
        const response = await GET(request);
        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data.lifetime.shows.length).toBe(1);
        expect(data.lifetime.shows[0].id).toBe(emptyShow.id);
        expect(data.lifetime.shows[0].stats.showRevenue).toBe(0);
    });
});
