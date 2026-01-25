import { prisma } from "@/lib/prisma"
import { BookingStatus, Prisma } from "@prisma/client"

/**
 * Booking Repository
 * Handles all database operations related to bookings
 */
export class BookingRepository {
    /**
     * Create a new booking
     */
    async create(data: Prisma.BookingCreateInput) {
        return prisma.booking.create({
            data,
            include: {
                show: {
                    select: {
                        id: true,
                        title: true,
                        date: true,
                        venue: true,
                        ticketPrice: true
                    }
                }
            }
        })
    }

    /**
     * Find bookings by user ID
     */
    async findByUser(userId: string, showId?: string) {
        return prisma.booking.findMany({
            where: showId ? { userId, showId } : { userId },
            include: {
                show: {
                    select: {
                        id: true,
                        title: true,
                        date: true,
                        venue: true,
                        ticketPrice: true,
                        posterImageUrl: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    }

    /**
     * Find a booking by its payment ID (for webhooks)
     */
    async findByPaymentId(paymentId: string) {
        return prisma.booking.findFirst({
            where: {
                paymentId,
                status: BookingStatus.PENDING
            }
        })
    }

    /**
     * Find a specific booking by ID
     */
    async findById(id: string) {
        return prisma.booking.findUnique({
            where: { id }
        })
    }

    /**
     * Update a booking
     */
    async update(id: string, data: Prisma.BookingUpdateInput) {
        return prisma.booking.update({
            where: { id },
            data
        })
    }

    /**
     * Delete existing bookings for a show (needed for admin delete show)
     */
    async deleteManyByShowId(showId: string) {
        return prisma.booking.deleteMany({
            where: { showId }
        })
    }
}

export const bookingRepository = new BookingRepository()
