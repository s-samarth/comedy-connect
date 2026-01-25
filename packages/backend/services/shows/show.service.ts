import { showRepository } from "@/repositories/show.repository"
import { UserRole } from "@prisma/client"
import { ValidationError, NotFoundError } from "@/errors"
import { prisma } from "@/lib/prisma"

export interface ListShowsParams {
    userId?: string
    userRole?: UserRole
    mode?: "public" | "manage" | "discovery"
}

export interface CreateShowData {
    title: string
    description?: string
    date: Date
    venue: string
    googleMapsLink: string
    ticketPrice: number
    totalTickets: number
    posterImageUrl?: string
    youtubeUrls?: string[]
    instagramUrls?: string[]
}

export interface UpdateShowData {
    title?: string
    description?: string
    date?: Date
    venue?: string
    googleMapsLink?: string
    ticketPrice?: number
    totalTickets?: number
    posterImageUrl?: string
    youtubeUrls?: string[]
    instagramUrls?: string[]
    comedianIds?: string[]
}

/**
 * Show Service
 * Contains all business logic related to shows
 */
export class ShowService {
    /**
     * Build visibility filter based on user role and mode
     * This encapsulates the complex authorization logic
     */
    private buildVisibilityFilter(params: ListShowsParams) {
        const { userId, userRole, mode } = params

        // Management mode - strictly only shows created by this user
        if (mode === "manage" && userId) {
            return { createdBy: userId }
        }

        // Public/discovery mode - only published shows
        if (mode === "public" || mode === "discovery") {
            return {
                isPublished: true,
                date: { gte: new Date() }
            }
        }

        // Guests and audience see only published shows
        if (!userId || userRole === "AUDIENCE") {
            return {
                isPublished: true,
                date: { gte: new Date() }
            }
        }

        // Organizers and comedians see published shows + their own drafts
        if (userRole?.startsWith("ORGANIZER") || userRole?.startsWith("COMEDIAN")) {
            return {
                AND: [
                    { date: { gte: new Date() } },
                    {
                        OR: [
                            { isPublished: true },
                            { createdBy: userId }
                        ]
                    }
                ]
            }
        }

        // Admin sees all future shows (unless in public mode)
        if (userRole === "ADMIN") {
            return { date: { gte: new Date() } }
        }

        // Default: only published future shows
        return {
            isPublished: true,
            date: { gte: new Date() }
        }
    }

    /**
     * List shows with visibility filtering
     */
    async listShows(params: ListShowsParams) {
        const filter = this.buildVisibilityFilter(params)
        const includeBookings = params.mode === "manage"

        const shows = await showRepository.findMany(filter, includeBookings)

        // If in manage mode, calculate stats
        if (params.mode === "manage") {
            return this.attachStats(shows)
        }

        return shows
    }

    /**
     * Get a single show by ID
     */
    async getShow(showId: string, userId?: string, userRole?: UserRole) {
        const show = await showRepository.findById(showId)

        if (!show) {
            throw new NotFoundError("Show")
        }

        // Visibility check: unpublished shows only visible to creator and admin
        if (!show.isPublished) {
            if (!userId || (show.createdBy !== userId && userRole !== 'ADMIN')) {
                throw new NotFoundError("Show")
            }
        }

        return show
    }

    /**
     * Attach booking stats to shows (for manage mode)
     */
    private attachStats(shows: any[]) {
        return shows.map(show => {
            const ticketsSold = show.bookings?.reduce((sum: number, b: any) => sum + b.quantity, 0) || 0
            const revenue = show.bookings?.reduce((sum: number, b: any) => sum + b.totalAmount, 0) || 0
            const { bookings, ...showWithoutBookings } = show

            return {
                ...showWithoutBookings,
                stats: {
                    ticketsSold,
                    revenue
                }
            }
        })
    }

    /**
     * Create a new show
     * Includes validation and transaction handling
     */
    async createShow(
        userId: string,
        userRole: UserRole,
        data: CreateShowData
    ) {
        // Validation
        if (!data.title || !data.date || !data.venue || !data.googleMapsLink || data.ticketPrice === undefined || data.totalTickets === undefined) {
            throw new ValidationError("Title, date, venue, location link, ticket price, and total tickets are required")
        }

        if (data.date <= new Date()) {
            throw new ValidationError("Show date must be in the future")
        }

        if (data.totalTickets <= 0) {
            throw new ValidationError("Total tickets must be greater than 0")
        }

        if (!Number.isInteger(data.ticketPrice) || data.ticketPrice <= 0) {
            throw new ValidationError("Ticket price must be a positive integer")
        }

        // Transaction: create show + inventory + associate comedians
        const result = await prisma.$transaction(async (tx) => {
            // Auto-add comedian to their own show if user is a comedian
            let finalComedianIds: string[] = []
            if (userRole.startsWith("COMEDIAN")) {
                const comedianProfile = await tx.comedian.findFirst({
                    where: { createdBy: userId }
                })

                if (comedianProfile && !finalComedianIds.includes(comedianProfile.id)) {
                    finalComedianIds = [comedianProfile.id, ...finalComedianIds]
                }
            }

            const show = await tx.show.create({
                data: {
                    title: data.title,
                    description: data.description,
                    date: data.date,
                    venue: data.venue,
                    googleMapsLink: data.googleMapsLink,
                    ticketPrice: data.ticketPrice,
                    totalTickets: data.totalTickets,
                    posterImageUrl: data.posterImageUrl,
                    youtubeUrls: data.youtubeUrls || [],
                    instagramUrls: data.instagramUrls || [],
                    isPublished: false, // Shows are created as drafts by default
                    createdBy: userId
                } as any
            })

            // Create ticket inventory
            await tx.ticketInventory.create({
                data: {
                    showId: show.id,
                    available: data.totalTickets
                }
            })

            // Associate comedians if provided
            if (finalComedianIds.length > 0) {
                await tx.showComedian.createMany({
                    data: finalComedianIds.map((comedianId, index) => ({
                        showId: show.id,
                        comedianId,
                        order: index
                    }))
                })
            }

            return show
        })

        return result
    }

    /**
     * Update a show
     */
    async updateShow(showId: string, userId: string, userRole: UserRole, data: UpdateShowData) {
        const show = await showRepository.findById(showId)

        if (!show) {
            throw new NotFoundError("Show")
        }

        // Verify ownership
        if (show.createdBy !== userId && userRole !== 'ADMIN') {
            throw new ValidationError("Permission denied")
        }

        const hasBookings = (show as any)._count.bookings > 0

        // If show is published with bookings, enforce immutability rules
        if (show.isPublished && hasBookings) {
            // Block price changes
            if (data.ticketPrice !== undefined && data.ticketPrice !== show.ticketPrice) {
                throw new ValidationError("Cannot change ticket price for a published show with bookings")
            }

            // Block capacity increases
            if (data.totalTickets !== undefined && data.totalTickets > show.totalTickets) {
                throw new ValidationError("Cannot increase capacity for a published show with bookings")
            }

            // Block comedian removal (handled in update logic below by check logic)
            if (data.comedianIds !== undefined) {
                const currentComedianIds = show.showComedians.map(sc => sc.comedianId)
                const removedComedians = currentComedianIds.filter(id => !data.comedianIds!.includes(id))

                if (removedComedians.length > 0) {
                    throw new ValidationError("Cannot remove comedians from a published show with bookings")
                }
            }
        }

        // Prepare update data
        const updateData: any = {}
        if (data.title) updateData.title = data.title
        if (data.description !== undefined) updateData.description = data.description
        if (data.venue) updateData.venue = data.venue
        if (data.googleMapsLink) updateData.googleMapsLink = data.googleMapsLink
        if (data.posterImageUrl !== undefined) updateData.posterImageUrl = data.posterImageUrl
        if (data.youtubeUrls !== undefined) updateData.youtubeUrls = data.youtubeUrls
        if (data.instagramUrls !== undefined) updateData.instagramUrls = data.instagramUrls

        // Only allow these if not published with bookings
        if (!show.isPublished || !hasBookings) {
            if (data.date) updateData.date = new Date(data.date)
            if (data.ticketPrice !== undefined) updateData.ticketPrice = data.ticketPrice
            if (data.totalTickets !== undefined) updateData.totalTickets = data.totalTickets
        }

        // Update the show
        const updatedShow = await showRepository.update(showId, updateData)

        // Handle comedian updates if provided
        if (data.comedianIds !== undefined) {
            await prisma.showComedian.deleteMany({
                where: { showId }
            })

            if (data.comedianIds.length > 0) {
                await prisma.showComedian.createMany({
                    data: data.comedianIds.map((comedianId: string, index: number) => ({
                        showId,
                        comedianId,
                        order: index
                    }))
                })
            }
        }

        return updatedShow
    }

    /**
     * Delete a show
     */
    async deleteShow(showId: string, userId: string, userRole: UserRole) {
        const show = await showRepository.findById(showId)

        if (!show) {
            throw new NotFoundError("Show")
        }

        if (show.createdBy !== userId && userRole !== 'ADMIN') {
            throw new ValidationError("Permission denied")
        }

        if ((show as any)._count.bookings > 0) {
            throw new ValidationError(`Cannot delete show with ${(show as any)._count.bookings} existing booking(s)`)
        }

        return showRepository.delete(showId)
    }

    /**
     * Publish a show (with validation)
     */
    async publishShow(showId: string, userId: string, userRole: UserRole) {
        // Fetch the show
        const show = await showRepository.findById(showId)

        if (!show) {
            throw new NotFoundError("Show")
        }

        // Verify ownership
        if (show.createdBy !== userId && userRole !== 'ADMIN') {
            throw new ValidationError("You don't have permission to publish this show")
        }

        // Verify user is verified
        const isVerified = userRole === 'ORGANIZER_VERIFIED' || userRole === 'COMEDIAN_VERIFIED' || userRole === 'ADMIN'
        if (!isVerified) {
            throw new ValidationError("Your account must be verified before you can publish shows")
        }

        // Validation checks before publishing
        if (show.isPublished) {
            throw new ValidationError("Show is already published")
        }

        // Date must be in future
        if (show.date <= new Date()) {
            throw new ValidationError("Show date must be in the future")
        }

        // Capacity must be greater than 0
        if (show.totalTickets <= 0) {
            throw new ValidationError("Show must have at least 1 ticket")
        }

        // Publish the show
        return showRepository.update(showId, { isPublished: true })
    }

    /**
     * Unpublish a show (with validation)
     */
    async unpublishShow(showId: string, userId: string, userRole: UserRole) {
        // Fetch the show
        const show = await showRepository.findById(showId)

        if (!show) {
            throw new NotFoundError("Show")
        }

        // Verify ownership or Admin
        if (show.createdBy !== userId && userRole !== 'ADMIN') {
            throw new ValidationError("You don't have permission to unpublish this show")
        }

        // Check if show is already unpublished
        if (!show.isPublished) {
            throw new ValidationError("Show is already unpublished")
        }

        // Check for bookings - cannot unpublish if tickets are sold
        if ((show as any)._count.bookings > 0) {
            throw new ValidationError("Cannot unpublish a show that has active bookings. Please cancel the show instead.")
        }

        // Unpublish the show
        return showRepository.update(showId, { isPublished: false })
    }
}

// Export singleton instance
export const showService = new ShowService()
