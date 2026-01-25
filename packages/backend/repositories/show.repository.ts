import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

/**
 * Show Repository
 * Handles all database operations related to shows
 * Services should call this instead of using Prisma directly
 */
export class ShowRepository {
    /**
     * Find multiple shows with complex filtering
     */
    async findMany(where: Prisma.ShowWhereInput, includeBookings = false) {
        return prisma.show.findMany({
            where,
            include: {
                creator: {
                    select: { email: true, role: true }
                },
                showComedians: {
                    include: {
                        comedian: {
                            select: {
                                id: true,
                                name: true,
                                bio: true,
                                profileImageUrl: true,
                                youtubeUrls: true,
                                instagramUrls: true,
                            } as any
                        }
                    },
                    orderBy: { order: "asc" }
                },
                ticketInventory: true,
                _count: {
                    select: { bookings: true }
                },
                // Include bookings for stats calculation in manage mode
                bookings: includeBookings ? {
                    where: {
                        status: {
                            in: ["CONFIRMED", "CONFIRMED_UNPAID"]
                        }
                    },
                    select: {
                        quantity: true,
                        totalAmount: true
                    }
                } : false
            },
            orderBy: { date: "asc" }
        })
    }

    /**
     * Find a single show by ID
     */
    async findById(id: string) {
        return prisma.show.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { email: true, role: true }
                },
                showComedians: {
                    include: {
                        comedian: {
                            select: {
                                id: true,
                                name: true,
                                bio: true,
                                profileImageUrl: true,
                                youtubeUrls: true,
                                instagramUrls: true,
                            }
                        }
                    },
                    orderBy: { order: "asc" }
                },
                ticketInventory: true,
                _count: {
                    select: { bookings: true }
                }
            }
        })
    }

    /**
     * Create a new show
     */
    async create(data: any) {
        return prisma.show.create({
            data
        })
    }

    /**
     * Update an existing show
     */
    async update(id: string, data: Prisma.ShowUpdateInput) {
        return prisma.show.update({
            where: { id },
            data
        })
    }

    /**
     * Delete a show
     */
    async delete(id: string) {
        return prisma.show.delete({
            where: { id }
        })
    }
}

// Export singleton instance
export const showRepository = new ShowRepository()
