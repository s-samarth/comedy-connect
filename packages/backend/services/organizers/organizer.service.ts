import { organizerRepository } from "@/repositories"
import { prisma } from "@/lib/prisma"
import { NotFoundError } from "@/errors"

/**
 * Organizer Service
 * Handles organizer-specific operations
 */
class OrganizerService {
    /**
     * Get organizer profile by user ID
     */
    async getOrganizerProfile(userId: string) {
        const profile = await prisma.organizerProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true
                    }
                }
            }
        })

        if (!profile) {
            throw new NotFoundError('Organizer profile')
        }

        return { profile }
    }

    /**
     * Create organizer profile
     */
    async createOrganizerProfile(userId: string, data: any) {
        const profile = await organizerRepository.create({
            user: { connect: { id: userId } },
            organizationName: data.organizationName,
            organizationType: data.organizationType || 'COMPANY',
            registrationNumber: data.registrationNumber,
            address: data.address,
            contactNumber: data.contactNumber,
            website: data.website
        } as any)

        return { profile }
    }

    /**
     * Update organizer profile
     */
    async updateOrganizerProfile(userId: string, data: any) {
        const profile = await organizerRepository.findByUserId(userId)

        if (!profile) {
            return this.createOrganizerProfile(userId, data)
        }

        // Update user name if provided
        if (data.name) {
            await prisma.user.update({
                where: { id: userId },
                data: { name: data.name }
            })
        }

        const updated = await organizerRepository.update(profile.id, {
            organizationName: data.organizationName,
            organizationType: data.organizationType,
            registrationNumber: data.registrationNumber,
            address: data.address,
            contactNumber: data.contactNumber,
            website: data.website
        })

        return { profile: updated }
    }
}

// Export singleton instance
export const organizerService = new OrganizerService()
