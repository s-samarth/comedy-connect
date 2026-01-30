import { http, HttpResponse } from 'msw';
import { mockBookings } from '../data/bookings.mock';

/**
 * MSW Handlers for Bookings API
 */

export const bookingsHandlers = [
    // POST /api/v1/bookings - Create booking
    http.post('*/api/v1/bookings', async ({ request }) => {
        const body = await request.json() as any;

        // Validate quantity
        if (!body.quantity || body.quantity < 1) {
            return HttpResponse.json(
                { error: 'Quantity must be at least 1' },
                { status: 400 }
            );
        }

        if (body.quantity > 10) {
            return HttpResponse.json(
                { error: 'Maximum 10 tickets per booking' },
                { status: 400 }
            );
        }

        const ticketPrice = 500;
        const subtotal = ticketPrice * body.quantity;
        const bookingFee = Math.round(subtotal * 0.05);
        const totalAmount = subtotal + bookingFee;

        const newBooking = {
            id: `booking-${Date.now()}`,
            userId: 'test-user-id',
            showId: body.showId,
            quantity: body.quantity,
            totalAmount,
            bookingFee,
            platformFee: Math.round(subtotal * 0.10),
            status: 'CONFIRMED',
            paymentId: `pay_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };

        return HttpResponse.json({ booking: newBooking }, { status: 201 });
    }),

    // GET /api/v1/bookings/my-bookings - Get user bookings
    http.get('*/api/v1/bookings/my-bookings', () => {
        const bookings = mockBookings();
        return HttpResponse.json({ bookings });
    }),

    // GET /api/v1/bookings/:id - Get single booking
    http.get('*/api/v1/bookings/:id', ({ params }) => {
        const { id } = params;
        const bookings = mockBookings();
        const booking = bookings.find(b => b.id === id);

        if (!booking) {
            return HttpResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        return HttpResponse.json({ booking });
    }),

    // DELETE /api/v1/bookings/:id - Cancel booking
    http.delete('*/api/v1/bookings/:id', ({ params }) => {
        const { id } = params;

        return HttpResponse.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    }),
];
