import { faker } from '@faker-js/faker';

/**
 * Factory for generating mock Booking data
 * Matches the Booking model from Prisma schema
 */

export interface MockBooking {
    id: string;
    userId: string;
    showId: string;
    quantity: number;
    totalAmount: number;
    bookingFee: number;
    platformFee: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'CONFIRMED_UNPAID';
    paymentId: string | null;
    razorpayOrderId: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export function createMockBooking(overrides?: Partial<MockBooking>): MockBooking {
    const quantity = faker.number.int({ min: 1, max: 10 });
    const ticketPrice = faker.number.int({ min: 200, max: 1500 });
    const subtotal = ticketPrice * quantity;
    const bookingFee = Math.round(subtotal * 0.05); // 5% booking fee
    const platformFee = Math.round(subtotal * 0.10); // 10% platform fee
    const totalAmount = subtotal + bookingFee;

    return {
        id: faker.string.uuid(),
        userId: faker.string.uuid(),
        showId: faker.string.uuid(),
        quantity,
        totalAmount,
        bookingFee,
        platformFee,
        status: 'CONFIRMED',
        paymentId: faker.string.alphanumeric(20),
        razorpayOrderId: faker.string.alphanumeric(20),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        ...overrides,
    };
}

export function createMockPendingBooking(overrides?: Partial<MockBooking>): MockBooking {
    return createMockBooking({
        status: 'PENDING',
        paymentId: null,
        razorpayOrderId: null,
        ...overrides,
    });
}

export function createMockConfirmedBooking(overrides?: Partial<MockBooking>): MockBooking {
    return createMockBooking({
        status: 'CONFIRMED',
        ...overrides,
    });
}

export function createMockCancelledBooking(overrides?: Partial<MockBooking>): MockBooking {
    return createMockBooking({
        status: 'CANCELLED',
        ...overrides,
    });
}

export function createMockUnpaidBooking(overrides?: Partial<MockBooking>): MockBooking {
    return createMockBooking({
        status: 'CONFIRMED_UNPAID',
        paymentId: null,
        ...overrides,
    });
}
