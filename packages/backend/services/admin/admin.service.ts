import { adminRepository } from "@/repositories/admin.repository"
import { bookingRepository } from "@/repositories/booking.repository"
import { showRepository } from "@/repositories/show.repository"
import { prisma } from "@/lib/prisma"
import { ValidationError, NotFoundError } from "@/errors"

export class AdminService {
    /**
     * Get all shows with stats (revenue, tickets sold)
     */
    async getShowsWithStats() {
        const shows = await adminRepository.findAllShowsWithCreator()
        const bookingStats = await adminRepository.getBookingStats()

        const statsMap = new Map()
        bookingStats.forEach((s: any) => {
            statsMap.set(s.showId, {
                revenue: Number(s.revenue || 0),
                ticketsSold: Number(s.ticketsSold || 0)
            })
        })

        // Map to format expected by frontend
        return shows.map((s: any) => {
            const creator = {
                email: s.creator?.email || "",
                organizerProfile: s.creator?.organizerProfile ? { name: s.creator.organizerProfile.name } : null
            }

            const stats = statsMap.get(s.id) || { revenue: 0, ticketsSold: 0 }

            return {
                id: s.id,
                title: s.title,
                description: s.description,
                date: s.date,
                venue: s.venue,
                ticketPrice: s.ticketPrice,
                totalTickets: s.totalTickets,
                posterImageUrl: s.posterImageUrl,
                createdAt: s.createdAt,
                isPublished: Boolean(s.isPublished),
                isDisbursed: Boolean(s.isDisbursed),
                customPlatformFee: s.customPlatformFee,
                creator,
                _count: {
                    bookings: stats.ticketsSold
                },
                stats
            }
        })
    }

    /**
     * Update custom platform fee
     */
    async updateShowFee(showId: string, fee: number) {
        if (fee !== null && (typeof fee !== 'number' || fee < 0 || fee > 100)) {
            throw new ValidationError("Invalid fee percentage (0-100 required)")
        }
        return adminRepository.updatePlatformFee(showId, fee)
    }

    /**
     * Toggle show publish status
     */
    async togglePublish(showId: string, isPublished: boolean) {
        return showRepository.update(showId, { isPublished })
    }

    /**
     * Set disbursed status
     */
    async setDisbursed(showId: string, isDisbursed: boolean) {
        return adminRepository.setDisbursed(showId, isDisbursed)
    }

    /**
     * Force delete a show (and its bookings)
     */
    async deleteShow(showId: string) {
        // Use transaction to delete bookings then show
        return prisma.$transaction(async (tx) => {
            // Delete related bookings manually
            await tx.booking.deleteMany({
                where: { showId: showId }
            })

            // Delete the show
            await tx.show.delete({
                where: { id: showId }
            })
        })
    }
}

export const adminService = new AdminService()
