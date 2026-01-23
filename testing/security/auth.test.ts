/**
 * Security Tests: Authentication
 * 
 * Tests to ensure authentication cannot be bypassed
 */

import { UserRole } from '@prisma/client';
import {
    createTestUser,
    cleanupTestData,
    disconnectTestDb
} from '../config/test-db';

// Mock the auth module
jest.mock('@/lib/auth', () => ({
    getCurrentUser: jest.fn(),
}));

import * as authModule from '@/lib/auth';

const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;

describe('Security: Authentication', () => {
    afterAll(async () => {
        await cleanupTestData();
        await disconnectTestDb();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Protected Endpoints Require Authentication', () => {
        const protectedEndpoints = [
            { path: '@/app/api/bookings/route', method: 'GET', name: 'GET /api/bookings' },
            { path: '@/app/api/bookings/route', method: 'POST', name: 'POST /api/bookings' },
            { path: '@/app/api/organizer/profile/route', method: 'GET', name: 'GET /api/organizer/profile' },
            { path: '@/app/api/auth/me/route', method: 'GET', name: 'GET /api/auth/me' },
        ];

        for (const endpoint of protectedEndpoints) {
            it(`${endpoint.name} should return 401 without auth`, async () => {
                mockGetCurrentUser.mockResolvedValue(null);

                const module = await import(endpoint.path);
                const handler = module[endpoint.method];

                let response;
                if (endpoint.method === 'POST') {
                    const request = new Request(`http://localhost:3000${endpoint.name.split(' ')[1]}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({}),
                    });
                    response = await handler(request);
                } else {
                    // Some GET handlers may need a request object
                    try {
                        const request = new Request(`http://localhost:3000${endpoint.name.split(' ')[1]}`, {
                            method: 'GET',
                        });
                        response = await handler(request);
                    } catch {
                        response = await handler();
                    }
                }

                expect(response.status).toBe(401);
            });
        }
    });

    describe('Admin Endpoints Require Admin Role', () => {
        const adminEndpoints = [
            '@/app/api/admin/organizers/route',
            '@/app/api/admin/shows/route',
            '@/app/api/admin/comedians/route',
            '@/app/api/admin/fees/route',
        ];

        for (const endpoint of adminEndpoints) {
            it(`${endpoint} should return 403 for non-admin`, async () => {
                const user = await createTestUser(UserRole.AUDIENCE, {
                    id: `test-sec-auth-${Date.now()}-${Math.random()}`,
                    email: `sec-auth-${Date.now()}@test.com`,
                });

                mockGetCurrentUser.mockResolvedValue({
                    id: user.id,
                    email: user.email,
                    role: UserRole.AUDIENCE,
                } as any);

                const module = await import(endpoint);
                const response = await module.GET();

                expect(response.status).toBe(403);
            });
        }
    });

    describe('Session Validation', () => {
        it('should reject requests with null user', async () => {
            mockGetCurrentUser.mockResolvedValue(null);

            const { POST } = await import('@/app/api/bookings/route');
            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: 'test', quantity: 1 }),
            });

            const response = await POST(request);
            expect(response.status).toBe(401);
        });

        it('should reject requests with undefined user', async () => {
            mockGetCurrentUser.mockResolvedValue(undefined as any);

            const { POST } = await import('@/app/api/bookings/route');
            const request = new Request('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ showId: 'test', quantity: 1 }),
            });

            const response = await POST(request);
            expect(response.status).toBe(401);
        });
    });
});
