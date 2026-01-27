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
     * Calculate platform fee (Commission)
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
     * Calculate booking fee (Convenience Fee)
     */
    private async calculateBookingFee(tx: any, ticketPrice: number, totalAmount: number): Promise<number> {
        const slabsConfig = await tx.platformConfig.findUnique({
            where: { key: "booking_fee_slabs" }
        })

        const slabs = (slabsConfig?.value as any[]) || [
            { minPrice: 0, maxPrice: 199, fee: 7 },
            { minPrice: 200, maxPrice: 400, fee: 8 },
            { minPrice: 401, maxPrice: 1000000, fee: 9 }
        ]

        const matchedSlab = slabs.find(
            (s) => ticketPrice >= s.minPrice && ticketPrice <= s.maxPrice
        )
        const bookingFeePercentage = (matchedSlab ? matchedSlab.fee : 8) / 100

        return totalAmount * bookingFeePercentage
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
