/**
 * Mock booking data for testing
 */

export function mockBookings() {
    return [
        {
            id: 'booking-1',
            userId: 'user-123',
            showId: 'show-1',
            quantity: 2,
            totalAmount: 1050,
            bookingFee: 50,
            platformFee: 100,
            status: 'CONFIRMED' as const,
            paymentId: 'pay_123',
            razorpayOrderId: 'order_123',
            createdAt: new Date('2026-01-20'),
        },
        {
            id: 'booking-2',
            userId: 'user-123',
            showId: 'show-2',
            quantity: 1,
            totalAmount: 840,
            bookingFee: 40,
            platformFee: 80,
            status: 'CONFIRMED' as const,
            paymentId: 'pay_456',
            razorpayOrderId: 'order_456',
            createdAt: new Date('2026-01-22'),
        },
        {
            id: 'booking-3',
            userId: 'user-123',
            showId: 'show-1',
            quantity: 3,
            totalAmount: 1575,
            bookingFee: 75,
            platformFee: 150,
            status: 'PENDING' as const,
            paymentId: null,
            razorpayOrderId: 'order_789',
            createdAt: new Date('2026-01-25'),
        },
    ];
}

export function mockSingleBooking() {
    return mockBookings()[0];
}
