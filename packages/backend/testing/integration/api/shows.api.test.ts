import request from 'supertest';
import { app } from '@/app';
import { resetDatabase } from '../utils/reset-db';
import { createAuthToken } from '../helpers/auth-helper';
import { createTestUser, createTestShow } from '../fixtures';

describe('Shows API - Integration Tests', () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    describe('GET /api/v1/shows', () => {
        it('should return list of published shows', async () => {
            // Create test data
            const organizer = await createTestUser({ role: 'ORGANIZER_VERIFIED' });
            await createTestShow({ creatorId: organizer.id, isPublished: true });
            await createTestShow({ creatorId: organizer.id, isPublished: true });

            const response = await request(app).get('/api/v1/shows');

            expect(response.status).toBe(200);
            expect(response.body.shows).toHaveLength(2);
            expect(response.body.shows[0]).toHaveProperty('id');
            expect(response.body.shows[0]).toHaveProperty('title');
        });

        it('should not return draft shows', async () => {
            const organizer = await createTestUser({ role: 'ORGANIZER_VERIFIED' });
            await createTestShow({ creatorId: organizer.id, isPublished: false });
            await createTestShow({ creatorId: organizer.id, isPublished: true });

            const response = await request(app).get('/api/v1/shows');

            expect(response.status).toBe(200);
            expect(response.body.shows).toHaveLength(1);
        });

        it('should filter shows by city', async () => {
            const organizer = await createTestUser({ role: 'ORGANIZER_VERIFIED' });
            await createTestShow({ creatorId: organizer.id, city: 'Hyderabad', isPublished: true });
            await createTestShow({ creatorId: organizer.id, city: 'Mumbai', isPublished: true });

            const response = await request(app).get('/api/v1/shows?city=Hyderabad');

            expect(response.status).toBe(200);
            expect(response.body.shows).toHaveLength(1);
            expect(response.body.shows[0].city).toBe('Hyderabad');
        });
    });

    describe('POST /api/v1/shows', () => {
        const validShowData = {
            title: 'Test Comedy Night',
            venue: 'Test Venue',
            city: 'Hyderabad',
            date: '2026-06-01',
            time: '19:00',
            duration: 90,
            category: 'Standup',
            ticketPrice: 500,
            totalSeats: 100,
        };

        it('should create show for verified organizer', async () => {
            const token = await createAuthToken({ role: 'ORGANIZER_VERIFIED' });

            const response = await request(app)
                .post('/api/v1/shows')
                .set('Authorization', `Bearer ${token}`)
                .send(validShowData);

            expect(response.status).toBe(201);
            expect(response.body.show).toHaveProperty('id');
            expect(response.body.show.title).toBe(validShowData.title);
        });

        it('should create show for verified comedian', async () => {
            const token = await createAuthToken({ role: 'COMEDIAN_VERIFIED' });

            const response = await request(app)
                .post('/api/v1/shows')
                .set('Authorization', `Bearer ${token}`)
                .send(validShowData);

            expect(response.status).toBe(201);
        });

        it('should reject request from audience', async () => {
            const token = await createAuthToken({ role: 'AUDIENCE' });

            const response = await request(app)
                .post('/api/v1/shows')
                .set('Authorization', `Bearer ${token}`)
                .send(validShowData);

            expect(response.status).toBe(403);
        });

        it('should reject request from unverified organizer', async () => {
            const token = await createAuthToken({ role: 'ORGANIZER_UNVERIFIED' });

            const response = await request(app)
                .post('/api/v1/shows')
                .set('Authorization', `Bearer ${token}`)
                .send(validShowData);

            expect(response.status).toBe(403);
        });

        it('should validate required fields', async () => {
            const token = await createAuthToken({ role: 'ORGANIZER_VERIFIED' });
            const invalidData = { title: '' };

            const response = await request(app)
                .post('/api/v1/shows')
                .set('Authorization', `Bearer ${token}`)
                .send(invalidData);

            expect(response.status).toBe(400);
        });

        it('should require authentication', async () => {
            const response = await request(app)
                .post('/api/v1/shows')
                .send(validShowData);

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/v1/shows/:id', () => {
        it('should return show details', async () => {
            const organizer = await createTestUser({ role: 'ORGANIZER_VERIFIED' });
            const show = await createTestShow({ creatorId: organizer.id, isPublished: true });

            const response = await request(app).get(`/api/v1/shows/${show.id}`);

            expect(response.status).toBe(200);
            expect(response.body.show.id).toBe(show.id);
            expect(response.body.show.title).toBe(show.title);
        });

        it('should return 404 for non-existent show', async () => {
            const response = await request(app).get('/api/v1/shows/non-existent-id');

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /api/v1/shows/:id', () => {
        it('should update show for owner', async () => {
            const token = await createAuthToken({ role: 'ORGANIZER_VERIFIED', id: 'user-123' });
            const show = await createTestShow({ creatorId: 'user-123', isPublished: false });

            const response = await request(app)
                .patch(`/api/v1/shows/${show.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Updated Title' });

            expect(response.status).toBe(200);
            expect(response.body.show.title).toBe('Updated Title');
        });

        it('should reject update from non-owner', async () => {
            const token = await createAuthToken({ role: 'ORGANIZER_VERIFIED', id: 'different-user' });
            const show = await createTestShow({ creatorId: 'original-owner', isPublished: false });

            const response = await request(app)
                .patch(`/api/v1/shows/${show.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Updated Title' });

            expect(response.status).toBe(403);
        });
    });
});
