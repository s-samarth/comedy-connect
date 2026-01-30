import { prisma } from '../utils/prisma';
import type { Booking, BookingStatus } from '@prisma/client';

/**
 * Create a test booking with optional overrides
 */
export async function createTestBooking(overrides: Partial<Booking> = {}): Promise<Booking> {
    const quantity = overrides.quantity || 2;
    const ticketPrice = 500;
    const subtotal = ticketPrice * quantity;
    const bookingFee = Math.round(subtotal * 0.05);
    const platformFee = Math.round(subtotal * 0.10);
    const totalAmount = subtotal + bookingFee;

    return await prisma.booking.create({
        data: {
            userId: 'default-user-id', // Should be overridden
            showId: 'default-show-id', // Should be overridden
            quantity,
            totalAmount,
            bookingFee,
            platformFee,
            status: 'CONFIRMED' as BookingStatus,
            paymentId: `pay_${Date.now()}`,
            razorpayOrderId: `order_${Date.now()}`,
            ...overrides,
        },
    });
}

/**
 * Create a confirmed booking
 */
export async function createConfirmedBooking(
    userId: string,
    showId: string,
    overrides: Partial<Booking> = {}
): Promise<Booking> {
    return await createTestBooking({
        userId,
        showId,
        status: 'CONFIRMED',
        ...overrides,
    });
}

/**
 * Create a pending booking
 */
export async function createPendingBooking(
    userId: string,
    showId: string,
    overrides: Partial<Booking> = {}
): Promise<Booking> {
    return await createTestBooking({
        userId,
        showId,
        status: 'PENDING',
        paymentId: null,
        razorpayOrderId: `order_${Date.now()}`,
        ...overrides,
    });
}

/**
 * Create multiple bookings for a show
 */
export async function createMultipleBookings(
    showId: string,
    count: number,
    overrides: Partial<Booking> = {}
): Promise<Booking[]> {
    const bookings: Booking[] = [];
    for (let i = 0; i < count; i++) {
        const booking = await createTestBooking({
            showId,
            userId: `user-${i}`,
            ...overrides,
        });
        bookings.push(booking);
    }
    return bookings;
}
