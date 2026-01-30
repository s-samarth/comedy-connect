import { bookingService } from '@/services/bookings/booking.service';
import { bookingRepository, showRepository } from '@/repositories';
import { ValidationError, NotFoundError, BusinessError } from '@/errors';

// Mock all repositories
jest.mock('@/repositories');

describe('Book

ingService - Unit Tests', () => {
    beforeEach(() => {
    jest.clearAllMocks();
});

describe('createBooking', () => {
    const userId = 'user-123';
    const showId = 'show-123';
    const validBookingData = {
        showId,
        quantity: 2,
    };

    it('should validate quantity is positive', async () => {
        const invalidData = { ...validBookingData, quantity: 0 };

        await expect(
            bookingService.createBooking(userId, invalidData)
        ).rejects.toThrow(ValidationError);
    });

    it('should validate quantity does not exceed maximum', async () => {
        const invalidData = { ...validBookingData, quantity: 11 };

        await expect(
            bookingService.createBooking(userId, invalidData)
        ).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError if show does not exist', async () => {
        (showRepository.findById as jest.Mock).mockResolvedValue(null);

        await expect(
            bookingService.createBooking(userId, validBookingData)
        ).rejects.toThrow(NotFoundError);
    });

    it('should throw BusinessError if show is not published', async () => {
        const mockShow = {
            id: showId,
            isPublished: false,
            ticketPrice: 500,
            availableSeats: 100,
        };
        (showRepository.findById as jest.Mock).mockResolvedValue(mockShow);

        await expect(
            bookingService.createBooking(userId, validBookingData)
        ).rejects.toThrow(BusinessError);
    });

    it('should throw BusinessError if not enough seats available', async () => {
        const mockShow = {
            id: showId,
            isPublished: true,
            ticketPrice: 500,
            availableSeats: 1,
        };
        (showRepository.findById as jest.Mock).mockResolvedValue(mockShow);

        await expect(
            bookingService.createBooking(userId, validBookingData)
        ).rejects.toThrow(BusinessError);
    });

    it('should create booking with correct fee calculations', async () => {
        const ticketPrice = 500;
        const quantity = 2;
        const mockShow = {
            id: showId,
            isPublished: true,
            ticketPrice,
            availableSeats: 100,
            platformFeePercent: 10,
        };

        (showRepository.findById as jest.Mock).mockResolvedValue(mockShow);
        (bookingRepository.create as jest.Mock).mockResolvedValue({
            id: 'booking-123',
            userId,
            showId,
            quantity,
        });

        await bookingService.createBooking(userId, validBookingData);

        expect(bookingRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                userId,
                showId,
                quantity,
                totalAmount: expect.any(Number),
                bookingFee: expect.any(Number),
                platformFee: expect.any(Number),
            })
        );
    });
});

describe('getUserBookings', () => {
    it('should return user bookings', async () => {
        const userId = 'user-123';
        const mockBookings = [
            { id: 'booking-1', userId, showId: 'show-1' },
            { id: 'booking-2', userId, showId: 'show-2' },
        ];
        (bookingRepository.findByUserId as jest.Mock).mockResolvedValue(mockBookings);

        const result = await bookingService.getUserBookings(userId);

        expect(result).toEqual(expect.objectContaining({
            bookings: mockBookings,
        }));
        expect(bookingRepository.findByUserId).toHaveBeenCalledWith(userId);
    });

    it('should return empty array if user has no bookings', async () => {
        const userId = 'user-123';
        (bookingRepository.findByUserId as jest.Mock).mockResolvedValue([]);

        const result = await bookingService.getUserBookings(userId);

        expect(result.bookings).toEqual([]);
    });
});
});
