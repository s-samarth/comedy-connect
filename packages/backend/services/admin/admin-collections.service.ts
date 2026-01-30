import { adminRepository } from "@/repositories/admin.repository"
import { ValidationError } from "@/errors"

/**
 * Admin Collections Service
 * Handles financial collections and disbursements
 */
class AdminCollectionsService {
    /**
     * Get collections summary (categorized as per frontend expectations)
     */
    async getCollectionsSummary(showId?: string) {
        // Fetch all shows with detailed info using repository
        const allShows = await adminRepository.findAllShowsWithCreator()

        // Filter by showId if provided (for specific show drilldown)
        const targetShows = showId ? allShows.filter(s => s.id === showId) : allShows

        // Map and enrich shows with calculated stats
        const enrichedShows = targetShows.map(show => {
            const bookings = (show as any).bookings || []

            const ticketsSold = bookings.reduce((sum: number, b: any) => sum + (b.quantity || 0), 0)
            const showRevenue = bookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)
            const bookingFee = bookings.reduce((sum: number, b: any) => sum + (b.bookingFee || 0), 0)
            const platformFee = bookings.reduce((sum: number, b: any) => sum + (b.platformFee || 0), 0)

            return {
                id: show.id,
                title: show.title,
                date: show.date,
                venue: show.venue,
                isPublished: show.isPublished,
                isDisbursed: show.isDisbursed,
                creator: {
                    email: show.creator.email,
                    organizerProfile: show.creator.organizerProfile ? {
                        name: show.creator.organizerProfile.name
                    } : undefined,
                    comedianProfile: show.creator.comedianProfile ? {
                        stageName: show.creator.comedianProfile.stageName
                    } : undefined
                },
                stats: {
                    showRevenue,
                    bookingFee,
                    platformFee,
                    platformRevenue: showRevenue + bookingFee,
                    platformEarnings: platformFee + bookingFee,
                    showEarnings: showRevenue - platformFee,
                    ticketsSold
                }
            }
        })

        // Helper to aggregate stats for a list of shows
        const aggregate = (shows: any[]) => {
            return {
                showRevenue: shows.reduce((sum, s) => sum + s.stats.showRevenue, 0),
                bookingFee: shows.reduce((sum, s) => sum + s.stats.bookingFee, 0),
                platformFee: shows.reduce((sum, s) => sum + s.stats.platformFee, 0),
                platformRevenue: shows.reduce((sum, s) => sum + s.stats.platformRevenue, 0),
                platformEarnings: shows.reduce((sum, s) => sum + s.stats.platformEarnings, 0),
                showEarnings: shows.reduce((sum, s) => sum + s.stats.showEarnings, 0),
                shows
            }
        }

        const now = new Date()

        // Categorize shows
        const categories = {
            lifetime: aggregate(enrichedShows),
            active: aggregate(enrichedShows.filter(s => s.isPublished && new Date(s.date) >= now)),
            pending: aggregate(enrichedShows.filter(s => !s.isDisbursed && new Date(s.date) < now)),
            booked: aggregate(enrichedShows.filter(s => s.isDisbursed)),
            unpublished: aggregate(enrichedShows.filter(s => !s.isPublished))
        }

        return categories
    }

    /**
     * Disburse funds for a show
     */
    async disburseShow(showId: string) {
        if (!showId) {
            throw new ValidationError('Show ID required')
        }

        await adminRepository.setDisbursed(showId, true)

        return { success: true, message: `Show ${showId} marked as disbursed` }
    }
}

export const adminCollectionsService = new AdminCollectionsService()
