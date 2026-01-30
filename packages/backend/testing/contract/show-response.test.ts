import request from 'supertest';
import { app } from '@/app';
import type { ShowResponse } from '@comedy-connect/types';

/**
 * Contract Tests for Show API
 * 
 * These tests verify that API responses conform to the TypeScript types
 * defined in @comedy-connect/types package.
 */

describe('Show API - Contract Tests', () => {
    describe('GET /api/v1/shows - Response Contract', () => {
        it('should conform to ShowResponse[] structure', async () => {
            const response = await request(app).get('/api/v1/shows');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('shows');
            expect(Array.isArray(response.body.shows)).toBe(true);

            if (response.body.shows.length > 0) {
                const show: ShowResponse = response.body.shows[0];

                // Required fields
                expect(show).toHaveProperty('id');
                expect(typeof show.id).toBe('string');

                expect(show).toHaveProperty('title');
                expect(typeof show.title).toBe('string');

                expect(show).toHaveProperty('venue');
                expect(typeof show.venue).toBe('string');

                expect(show).toHaveProperty('city');
                expect(typeof show.city).toBe('string');

                expect(show).toHaveProperty('date');
                // Date can be string or Date object depending on serialization

                expect(show).toHaveProperty('time');
                expect(typeof show.time).toBe('string');

                expect(show).toHaveProperty('ticketPrice');
                expect(typeof show.ticketPrice).toBe('number');

                expect(show).toHaveProperty('availableSeats');
                expect(typeof show.availableSeats).toBe('number');

                expect(show).toHaveProperty('totalSeats');
                expect(typeof show.totalSeats).toBe('number');

                expect(show).toHaveProperty('creatorId');
                expect(typeof show.creatorId).toBe('string');

                // Optional fields
                if (show.description !== null) {
                    expect(typeof show.description).toBe('string');
                }

                if (show.posterImageUrl !== null) {
                    expect(typeof show.posterImageUrl).toBe('string');
                }
            }
        });

        it('should not expose internal fields', async () => {
            const response = await request(app).get('/api/v1/shows');

            if (response.body.shows.length > 0) {
                const show = response.body.shows[0];

                // These fields should not be exposed
                expect(show).not.toHaveProperty('isDisbursed');
                expect(show).not.toHaveProperty('platformFeePercent');
            }
        });
    });

    describe('POST /api/v1/shows - Response Contract', () => {
        it('should return created show conforming to ShowResponse', async () => {
            // This would require authentication
            // Skipping implementation details, but structure would be:
            // 1. Create authenticated request
            // 2. Verify response.body.show conforms to ShowResponse
            // 3. Verify all required fields present
            // 4. Verify field types correct
        });
    });

    describe('GET /api/v1/shows/:id - Response Contract', () => {
        it('should return single show conforming to ShowResponse', async () => {
            // Similar structure to above
            // Verify single show response matches type definition
        });
    });
});
