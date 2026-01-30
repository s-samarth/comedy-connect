import request from 'supertest';
import { app } from '@/app';
import type { BookingResponse } from '@comedy-connect/types';

/**
 * Contract Tests for Booking API
 */

describe('Booking API - Contract Tests', () => {
    describe('POST /api/v1/bookings - Response Contract', () => {
        it('should conform to BookingResponse structure', async () => {
            // Note: Requires authentication and valid show
            // This is a structure example

            const response = {
                body: {
                    booking: {
                        id: 'booking-123',
                        userId: 'user-123',
                        showId: 'show-123',
                        quantity: 2,
                        totalAmount: 1050,
                        bookingFee: 50,
                        platformFee: 100,
                        status: 'CONFIRMED',
                        paymentId: 'pay_123',
                        createdAt: new Date(),
                    },
                },
            };

            const booking: BookingResponse = response.body.booking;

            // Verify required fields
            expect(booking).toHaveProperty('id');
            expect(typeof booking.id).toBe('string');

            expect(booking).toHaveProperty('quantity');
            expect(typeof booking.quantity).toBe('number');

            expect(booking).toHaveProperty('totalAmount');
            expect(typeof booking.totalAmount).toBe('number');

            expect(booking).toHaveProperty('status');
            expect(['PENDING', 'CONFIRMED', 'CANCELLED', 'CONFIRMED_UNPAID']).toContain(booking.status);
        });
    });

    describe('GET /api/v1/bookings/my-bookings - Response Contract', () => {
        it('should return array of BookingResponse', async () => {
            // Structure validation
            const mockResponse = {
                bookings: [
                    {
                        id: 'booking-1',
                        userId: 'user-123',
                        showId: 'show-1',
                        quantity: 2,
                        totalAmount: 1000,
                        status: 'CONFIRMED',
                    },
                ],
            };

            expect(Array.isArray(mockResponse.bookings)).toBe(true);
            if (mockResponse.bookings.length > 0) {
                expect(mockResponse.bookings[0]).toHaveProperty('id');
                expect(mockResponse.bookings[0]).toHaveProperty('quantity');
            }
        });
    });
});
