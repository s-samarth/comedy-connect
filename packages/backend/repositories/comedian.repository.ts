import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

/**
 * Comedian Repository
 * Handles all database operations related to comedian profiles
 */
export class ComedianRepository {
    /**
     * Find multiple comedians with optional filtering
     */
    async findMany(where?: Prisma.ComedianProfileWhereInput) {
        return prisma.comedianProfile.findMany({
            where,
            select: {
                id: true,
                name: true,
                bio: true,
                profileImageUrl: true,
                youtubeUrls: true,
                instagramUrls: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true
                    }
                }
            }
        })
    }

    /**
     * Find a single comedian by profile ID
     */
    async findById(id: string) {
        return prisma.comedianProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true
                    }
                }
            }
        })
    }

    /**
     * Find comedian profile by user ID
     */
    async findByUserId(userId: string) {
        return prisma.comedianProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true
                    }
                }
            }
        })
    }

    /**
     * Create a new comedian profile
     */
    async create(data: Prisma.ComedianProfileCreateInput) {
        return prisma.comedianProfile.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true
                    }
                }
            }
        })
    }

    /**
     * Update an existing comedian profile
     */
    async update(id: string, data: Prisma.ComedianProfileUpdateInput) {
        return prisma.comedianProfile.update({
            where: { id },
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true
                    }
                }
            }
        })
    }

    /**
     * Upsert comedian profile (create or update based on userId)
     */
    async upsert(userId: string, data: Prisma.ComedianProfileCreateInput) {
        return prisma.comedianProfile.upsert({
            where: { userId },
            create: data,
            update: data,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        role: true
                    }
                }
            }
        })
    }
}

// Export singleton instance
export const comedianRepository = new ComedianRepository()
