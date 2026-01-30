import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

/**
 * Organizer Repository
 * Handles all database operations related to organizer profiles
 */
export class OrganizerRepository {
    /**
     * Find multiple organizers with optional filtering
     */
    async findMany(where?: Prisma.OrganizerProfileWhereInput) {
        return prisma.organizerProfile.findMany({
            where,
            select: {
                id: true,
                organizationName: true,
                organizationType: true,
                registrationNumber: true,
                address: true,
                contactNumber: true,
                website: true,
                userId: true,
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
     * Find a single organizer by profile ID
     */
    async findById(id: string) {
        return prisma.organizerProfile.findUnique({
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
     * Find organizer profile by user ID
     */
    async findByUserId(userId: string) {
        return prisma.organizerProfile.findUnique({
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
     * Create a new organizer profile
     */
    async create(data: Prisma.OrganizerProfileCreateInput) {
        return prisma.organizerProfile.create({
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
     * Update an existing organizer profile
     */
    async update(id: string, data: Prisma.OrganizerProfileUpdateInput) {
        return prisma.organizerProfile.update({
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
     * Upsert organizer profile (create or update based on userId)
     */
    async upsert(userId: string, data: Prisma.OrganizerProfileCreateInput) {
        return prisma.organizerProfile.upsert({
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
export const organizerRepository = new OrganizerRepository()
