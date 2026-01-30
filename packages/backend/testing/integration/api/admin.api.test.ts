import request from 'supertest';
import { app } from '@/app';
import { resetDatabase } from '../utils/reset-db';
import { createAuthToken } from '../helpers/auth-helper';

describe('Admin API - Integration Tests', () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    describe('GET /api/v1/admin/stats', () => {
        it('should return dashboard statistics for admin', async () => {
            const token = await createAuthToken({ role: 'ADMIN' });

            const response = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('totalUsers');
            expect(response.body).toHaveProperty('totalShows');
            expect(response.body).toHaveProperty('totalRevenue');
        });

        it('should deny access to non-admin users', async () => {
            const token = await createAuthToken({ role: 'AUDIENCE' });

            const response = await request(app)
                .get('/api/v1/admin/stats')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(403);
        });
    });

    describe('GET /api/v1/admin/comedians', () => {
        it('should return pending comedian approvals', async () => {
            const token = await createAuthToken({ role: 'ADMIN' });

            const response = await request(app)
                .get('/api/v1/admin/comedians')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('comedians');
            expect(Array.isArray(response.body.comedians)).toBe(true);
        });
    });

    describe('POST /api/v1/admin/comedians/:id/approve', () => {
        it('should approve comedian application', async () => {
            const token = await createAuthToken({ role: 'ADMIN' });

            const response = await request(app)
                .post('/api/v1/admin/comedians/test-id/approve')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('GET /api/v1/admin/collections', () => {
        it('should return financial collections', async () => {
            const token = await createAuthToken({ role: 'ADMIN' });

            const response = await request(app)
                .get('/api/v1/admin/collections')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('collections');
        });
    });
});
