import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@prisma/client"
import { ValidationError, BookingError, NotFoundError } from "@/errors"
import { bookingRepository } from "@/repositories/booking.repository"

export class BookingService {
    /**
     * Create a new booking
     * Handles availability check, fee calculation, and inventory locking
     */
    async createBooking(userId: string, showId: string, quantity: number) {
        // Validation
        if (!showId || !quantity || quantity <= 0) {
            throw new ValidationError("Show ID and quantity are required")
        }

        if (quantity > 10) {
            throw new ValidationError("Maximum 10 tickets per booking")
        }

        // Use transaction to ensure atomic inventory update
        const result = await prisma.$transaction(async (tx) => {
            // Get show with inventory
            const show = await tx.show.findUnique({
                where: { id: showId },
                include: {
                    ticketInventory: true,
                    showComedians: true,
                    creator: {
                        include: {
                            organizerProfile: true,
                            comedianProfile: true
                        }
                    }
                }
            })

            if (!show) {
                throw new NotFoundError("Show")
            }

            // Check if show is in the future
            if (new Date(show.date) <= new Date()) {
                throw new BookingError("Cannot book past shows")
            }

            // Check available tickets
            const inventory = (show as any).ticketInventory
            const available = Array.isArray(inventory)
                ? inventory[0]?.available
                : inventory?.available

            if (!available || available < quantity) {
                throw new BookingError("Not enough tickets available")
            }

            // Calculate fees
            const totalAmount = show.ticketPrice * quantity
            const platformFee = this.calculatePlatformFee(show, totalAmount)
            const bookingFee = await this.calculateBookingFee(tx, show.ticketPrice, totalAmount)

            // Update inventory
            await tx.ticketInventory.update({
                where: {
                    showId,
                    available: { gte: quantity }
                },
                data: {
                    available: { decrement: quantity }
                }
            })

            // Create booking
            // Note: We use the repository pattern but inside a transaction here.
            // Since repositories use the global prisma instance, we need to be careful.
            // For complex transactions spanning multiple tables, strictly creating logic inside transaction is safer unless we pass tx to repo.
            // To keep it simple and consistent with the plan, we'll keep the transaction logic here but use the structure we defined.

            const booking = await tx.booking.create({
                data: {
                    showId,
                    userId,
                    quantity,
                    totalAmount,
                    platformFee,
                    bookingFee,
                    status: BookingStatus.CONFIRMED_UNPAID
                },
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

            return booking
        })

        return result
    }

    /**
     * Calculate Platform Fee
     * Money (percentage of show revenue) that Comedy Connect takes from the Organisers or Comedians.
     * This is deducted from their earnings.
     */
    private calculatePlatformFee(show: any, totalAmount: number): number {
        let commPercentage = 0.08 // 8% default

        if (show.customPlatformFee !== null && show.customPlatformFee !== undefined) {
            commPercentage = show.customPlatformFee / 100
        } else {
            const creator = show.creator
            const userFee = creator.organizerProfile?.customPlatformFee ?? creator.comedianProfile?.customPlatformFee
            if (userFee !== null && userFee !== undefined) {
                commPercentage = userFee / 100
            }
        }

        return totalAmount * commPercentage
    }

    /**
     * Calculate Booking Fee
     * Money that Comedy Connect takes per ticket booking from the Customer.
     * Usually a percentage of the ticket price added on top.
     */
    private async calculateBookingFee(tx: any, ticketPrice: number, totalAmount: number): Promise<number> {
        const configRecord = await tx.platformConfig.findUnique({
            where: { key: "PLATFORM_FEES" }
        })

        const config = configRecord?.value as any
        const slabs = config?.feeSlabs || config?.slabs || [
            { minPrice: 0, maxPrice: 199, fee: 0.07 },
            { minPrice: 200, maxPrice: 400, fee: 0.08 },
            { minPrice: 401, maxPrice: 1000000, fee: 0.09 }
        ]

        const matchedSlab = slabs.find(
            (s: any) => ticketPrice >= s.minPrice && ticketPrice <= s.maxPrice
        )

        // The 'fee' in slabs is stored as decimal (e.g. 0.05 for 5%)
        const bookingFeePercentage = matchedSlab ? matchedSlab.fee : 0.08

        return totalAmount * bookingFeePercentage
    }

    /**
     * Find a specific booking by ID (with ownership check)
     */
    async getBookingById(bookingId: string, userId: string) {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
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
            }
        })

        if (!booking) {
            throw new NotFoundError("Booking")
        }

        // Ownership check
        if (booking.userId !== userId) {
            throw new ValidationError("Unauthorized access to booking")
        }

        return booking
    }

    /**
     * Get user bookings
     */
    async getUserBookings(userId: string, showId?: string) {
        return bookingRepository.findByUser(userId, showId)
    }

    /**
     * Process payment webhook
     * Confirms booking and updates inventory
     */
    async processPaymentSuccess(paymentId: string, paymentEntityId: string) {
        const booking = await bookingRepository.findByPaymentId(paymentId)

        if (!booking) {
            throw new NotFoundError("Booking for payment")
        }

        const show = await prisma.show.findUnique({
            where: { id: booking.showId },
            include: { ticketInventory: true }
        })


        if (!show || !show.ticketInventory) {
            throw new NotFoundError("Show or inventory")
        }

        // Fix Bug 2: Use stored platform fee instead of hardcoding 8%
        // const platformFee = booking.totalAmount * 0.08 
        const platformFee = booking.platformFee

        // Update booking status
        await bookingRepository.update(booking.id, {
            status: BookingStatus.CONFIRMED,
            paymentId: paymentEntityId,
            platformFee
        })

        // Fix Bug 1: Remove double-decrement of inventory
        // The inventory is already decremented during createBooking transaction.
        // We do NOT need to decrement it again here.


        return booking
    }

    async processPaymentFailure(paymentId: string) {
        const booking = await bookingRepository.findByPaymentId(paymentId)

        if (booking) {
            // Update status
            await bookingRepository.update(booking.id, {
                status: BookingStatus.FAILED
            })

            // Release tickets (logic from webhook)
            const show = await prisma.show.findUnique({
                where: { id: booking.showId },
                include: { ticketInventory: true }
            })

            if (show && show.ticketInventory) {
                await prisma.ticketInventory.update({
                    where: { showId: booking.showId },
                    data: {
                        available: { increment: booking.quantity },
                        locked: { decrement: booking.quantity }
                    }
                })
            }
        }
    }
}

export const bookingService = new BookingService()
