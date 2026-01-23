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
    requireAdmin: jest.fn(),
}));

import * as authModule from '@/lib/auth';

const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;
const mockRequireAdmin = authModule.requireAdmin as jest.MockedFunction<typeof authModule.requireAdmin>;

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
                mockRequireAdmin.mockRejectedValue(new Error('Access denied'));

                const module = await import(endpoint);
                let response;
                if (endpoint.includes('shows')) {
                    // Start of workaround: Import NextRequest dynamically or use existing Request if compatible
                    // But NextRequest is preferred for Next.js API routes.
                    // Since I cannot easily import NextRequest here without adding top-level import, I'll use standard Request casted or try to rely on current scope if available.
                    // auth.test.ts doesn't import NextRequest. I'll pass a standard Request but cast it if needed, or better, require 'next/server'.
                    const { NextRequest } = require('next/server');
                    const request = new NextRequest('http://localhost:3000/api/admin/shows');
                    response = await module.GET(request);
                } else {
                    response = await module.GET();
                }

                expect([401, 403]).toContain(response.status);
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
