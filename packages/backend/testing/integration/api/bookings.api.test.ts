import request from 'supertest';
import { app } from '@/app';
import { resetDatabase } from '../utils/reset-db';
import { createAuthToken } from '../helpers/auth-helper';
import { createTestUser, createTestShow } from '../fixtures';

describe('Bookings API - Integration Tests', () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    describe('POST /api/v1/bookings', () => {
        it('should create booking for authenticated user', async () => {
            const user = await createTestUser({ role: 'AUDIENCE' });
            const organizer = await createTestUser({ role: 'ORGANIZER_VERIFIED' });
            const show = await createTestShow({
                creatorId: organizer.id,
                isPublished: true,
                availableSeats: 100,
                ticketPrice: 500,
            });

            const token = await createAuthToken({ id: user.id, role: 'AUDIENCE' });

            const response = await request(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    showId: show.id,
                    quantity: 2,
                });

            expect(response.status).toBe(201);
            expect(response.body.booking).toHaveProperty('id');
            expect(response.body.booking.quantity).toBe(2);
            expect(response.body.booking.showId).toBe(show.id);
        });

        it('should reject booking for unpublished show', async () => {
            const user = await createTestUser({ role: 'AUDIENCE' });
            const organizer = await createTestUser({ role: 'ORGANIZER_VERIFIED' });
            const show = await createTestShow({
                creatorId: organizer.id,
                isPublished: false,
            });

            const token = await createAuthToken({ id: user.id, role: 'AUDIENCE' });

            const response = await request(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    showId: show.id,
                    quantity: 2,
                });

            expect(response.status).toBe(400);
        });

        it('should reject booking exceeding available seats', async () => {
            const user = await createTestUser({ role: 'AUDIENCE' });
            const organizer = await createTestUser({ role: 'ORGANIZER_VERIFIED' });
            const show = await createTestShow({
                creatorId: organizer.id,
                isPublished: true,
                availableSeats: 5,
            });

            const token = await createAuthToken({ id: user.id, role: 'AUDIENCE' });

            const response = await request(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    showId: show.id,
                    quantity: 10,
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toMatch(/not enough seats/i);
        });

        it('should require authentication', async () => {
            const response = await request(app)
                .post('/api/v1/bookings')
                .send({
                    showId: 'show-id',
                    quantity: 2,
                });

            expect(response.status).toBe(401);
        });

        it('should validate quantity is positive', async () => {
            const token = await createAuthToken({ role: 'AUDIENCE' });

            const response = await request(app)
                .post('/api/v1/bookings')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    showId: 'show-id',
                    quantity: 0,
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/v1/bookings/my-bookings', () => {
        it('should return user bookings', async () => {
            const user = await createTestUser({ role: 'AUDIENCE' });
            const organizer = await createTestUser({ role: 'ORGANIZER_VERIFIED' });
            const show1 = await createTestShow({ creatorId: organizer.id, isPublished: true });
            const show2 = await createTestShow({ creatorId: organizer.id, isPublished: true });

            // Create bookings (this would use booking repository in real code)
            // For now, assuming bookings exist

            const token = await createAuthToken({ id: user.id, role: 'AUDIENCE' });

            const response = await request(app)
                .get('/api/v1/bookings/my-bookings')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('bookings');
            expect(Array.isArray(response.body.bookings)).toBe(true);
        });

        it('should require authentication', async () => {
            const response = await request(app).get('/api/v1/bookings/my-bookings');

            expect(response.status).toBe(401);
        });
    });

    describe('DELETE /api/v1/bookings/:id', () => {
        it('should cancel booking for owner', async () => {
            // Implementation depends on cancel booking logic
        });

        it('should reject cancellation from non-owner', async () => {
            // Implementation depends on cancel booking logic
        });
    });
});
