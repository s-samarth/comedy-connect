import request from 'supertest';
import { app } from '@/app';
import { resetDatabase } from '../utils/reset-db';
import { createAuthToken } from '../helpers/auth-helper';
import { createTestUser } from '../fixtures';

/**
 * RBAC Security Tests
 * 
 * These tests verify that role-based access control is properly enforced
 * across all API endpoints, preventing unauthorized access and privilege escalation.
 */

describe('RBAC Security Tests', () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    describe('Show Creation - RBAC', () => {
        const createShowData = {
            title: 'Test Show',
            venue: 'Test Venue',
            city: 'Hyderabad',
            date: '2026-06-01',
            time: '19:00',
            duration: 90,
            category: 'Standup',
            ticketPrice: 500,
            totalSeats: 100,
        };

        it('should allow ORGANIZER_VERIFIED to create shows', async () => {
            const token = await createAuthToken({ role: 'ORGANIZER_VERIFIED' });

            const response = await request(app)
                .post('/api/v1/shows')
                .set('Authorization', `Bearer ${token}`)
                .send(createShowData);

            expect(response.status).toBe(201);
        });

        it('should allow COMEDIAN_VERIFIED to create shows', async () => {
            const token = await createAuthToken({ role: 'COMEDIAN_VERIFIED' });

            const response = await request(app)
                .post('/api/v1/shows')
                .set('Authorization', `Bearer ${token}`)
                .send(createShowData);

            expect(response.status).toBe(201);
        });

        it('should deny AUDIENCE from creating shows', async () => {
            const token = await createAuthToken({ role: 'AUDIENCE' });

            const response = await request(app)
                .post('/api/v1/shows')
                .set('Authorization', `Bearer ${token}`)
                .send(createShowData);

            expect(response.status).toBe(403);
            expect(response.body.error).toMatch(/unauthorized|forbidden/i);
        });

        it('should deny ORGANIZER_UNVERIFIED from creating shows', async () => {
            const token = await createAuthToken({ role: 'ORGANIZER_UNVERIFIED' });

            const response = await request(app)
                .post('/api/v1/shows')
                .set('Authorization', `Bearer ${token}`)
                .send(createShowData);

            expect(response.status).toBe(403);
        });

        it('should deny COMEDIAN_UNVERIFIED from creating shows', async () => {
            const token = await createAuthToken({ role: 'COMEDIAN_UNVERIFIED' });

            const response = await request(app)
                .post('/api/v1/shows')
                .set('Authorization', `Bearer ${token}`)
                .send(createShowData);

            expect(response.status).toBe(403);
        });
    });

    describe('Admin Endpoints - RBAC', () => {
        it('should allow ADMIN to access admin routes', async () => {
            const token = await createAuthToken({ role: 'ADMIN' });

            const response = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).not.toBe(403);
        });

        it('should deny ORGANIZER_VERIFIED from admin routes', async () => {
            const token = await createAuthToken({ role: 'ORGANIZER_VERIFIED' });

            const response = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
        });

        it('should deny COMEDIAN_VERIFIED from admin routes', async () => {
            const token = await createAuthToken({ role: 'COMEDIAN_VERIFIED' });

            const response = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
        });

        it('should deny AUDIENCE from admin routes', async () => {
            const token = await createAuthToken({ role: 'AUDIENCE' });

            const response = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
        });
    });

    describe('Resource Ownership - RBAC', () => {
        it('should allow user to update own profile', async () => {
            const userId = 'user-123';
            const token = await createAuthToken({ id: userId, role: 'AUDIENCE' });

            const response = await request(app)
                .patch('/api/v1/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Name' });

            expect(response.status).not.toBe(403);
        });

        it('should deny user from updating other user profile', async () => {
            const token = await createAuthToken({ id: 'user-123', role: 'AUDIENCE' });

            const response = await request(app)
                .patch('/api/v1/users/different-user-id')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Name' });

            expect(response.status).toBe(403);
        });

        it('should allow owner to delete own show', async () => {
            const userId = 'user-123';
            const token = await createAuthToken({ id: userId, role: 'ORGANIZER_VERIFIED' });

            // Create show first
            const createResponse = await request(app)
                .post('/api/v1/shows')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: 'Test Show',
                    venue: 'Test Venue',
                    city: 'Hyderabad',
                    date: '2026-06-01',
                    time: '19:00',
                    duration: 90,
                    category: 'Standup',
                    ticketPrice: 500,
                    totalSeats: 100,
                });

            const showId = createResponse.body.show.id;

            const deleteResponse = await request(app)
                .delete(`/api/v1/shows/${showId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(deleteResponse.status).not.toBe(403);
        });

        it('should deny non-owner from deleting show', async () => {
            const token = await createAuthToken({ id: 'different-user', role: 'ORGANIZER_VERIFIED' });

            const response = await request(app)
                .delete('/api/v1/shows/show-owned-by-someone-else')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
        });
    });

    describe('Privilege Escalation Prevention', () => {
        it('should prevent user from changing their own role', async () => {
            const userId = 'user-123';
            const token = await createAuthToken({ id: userId, role: 'AUDIENCE' });

            const response = await request(app)
                .patch('/api/v1/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({ role: 'ADMIN' });

            // Role change should either be ignored or rejected
            expect(response.status).not.toBe(200);
            // OR if it succeeds, verify role wasn't actually changed
        });

        it('should prevent token forgery with invalid signature', async () => {
            const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMTIzIiwicm9sZSI6IkFETUlOIn0.invalid-signature';

            const response = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${forgedToken}`);

            expect(response.status).toBe(401);
        });
    });
});
