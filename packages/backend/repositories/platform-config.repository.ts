import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

/**
 * Platform Config Repository
 * Handles all database operations related to platform configuration (fees, slabs, etc.)
 */
export class PlatformConfigRepository {
    /**
     * Get the current platform configuration
     * Note: There should only be one config record
     */
    async get() {
        return prisma.platformConfig.findUnique({
            where: { key: 'PLATFORM_FEES' }
        })
    }

    /**
     * Create platform configuration
     */
    async create(data: Prisma.PlatformConfigCreateInput) {
        return prisma.platformConfig.create({
            data
        })
    }

    /**
     * Update platform configuration
     * Uses the first (and only) config record
     */
    async update(data: Prisma.PlatformConfigUpdateInput) {
        const config = await this.get()
        if (!config) {
            throw new Error('Platform config not found')
        }

        return prisma.platformConfig.update({
            where: { id: config.id },
            data
        })
    }

    /**
     * Upsert platform configuration
     */
    async upsert(value: any) {
        return prisma.platformConfig.upsert({
            where: { key: 'PLATFORM_FEES' },
            create: {
                key: 'PLATFORM_FEES',
                value
            },
            update: {
                value
            }
        })
    }
}

// Export singleton instance
export const platformConfigRepository = new PlatformConfigRepository()
