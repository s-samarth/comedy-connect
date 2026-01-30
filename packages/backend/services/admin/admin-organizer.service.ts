import { prisma } from "@/lib/prisma"
import { userRepository, approvalRepository } from "@/repositories"
import { ValidationError, NotFoundError } from "@/errors"

/**
 * Admin Organizer Service
 * Handles organizer user management and approvals
 */
class AdminOrganizerService {
    /**
     * List all organizer users
     */
    async listOrganizerUsers() {
        const organizers = await prisma.user.findMany({
            where: {
                role: { in: ['ORGANIZER_VERIFIED', 'ORGANIZER_UNVERIFIED'] }
            },
            include: {
                organizerProfile: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return { organizers }
    }

    /**
     * Get organizer profiles with fee information
     */
    async getOrganizerProfiles() {
        const profileFees = await prisma.$queryRaw`
            SELECT 
                op.id,
                op."customPlatformFee"
            FROM "OrganizerProfile" op
        ` as any[]

        return { profileFees }
    }

    /**
     * Update custom fee for organizer
     */
    async updateCustomFee(organizerId: string, feePercent: number) {
        if (feePercent < 0 || feePercent > 100) {
            throw new ValidationError('Invalid fee percentage (0-100 required)')
        }

        // Update the organizer profile fee
        await prisma.organizerProfile.update({
            where: { userId: organizerId },
            data: { customPlatformFee: feePercent }
        })

        return { success: true }
    }

    /**
     * Approve organizer
     */
    async approveOrganizer(organizerId: string, adminId: string) {
        const user = await prisma.user.findUnique({
            where: { id: organizerId },
            include: {
                organizerProfile: true
            }
        })

        if (!user || !user.organizerProfile) {
            throw new NotFoundError('Organizer')
        }

        // Update user role to verified
        await prisma.user.update({
            where: { id: organizerId },
            data: { role: 'ORGANIZER_VERIFIED' }
        })

        // Record approval history
        await approvalRepository.upsertOrganizerApproval(user.organizerProfile.id, adminId, 'APPROVED')

        return { success: true }
    }

    /**
     * Reject organizer
     */
    async rejectOrganizer(organizerId: string, adminId: string, reason?: string) {
        const user = await prisma.user.findUnique({
            where: { id: organizerId },
            include: {
                organizerProfile: true
            }
        })

        if (!user || !user.organizerProfile) {
            throw new NotFoundError('Organizer')
        }

        // Just update the user role back to unverified
        await prisma.user.update({
            where: { id: organizerId },
            data: { role: 'ORGANIZER_UNVERIFIED' }
        })

        // Record rejection history
        await approvalRepository.upsertOrganizerApproval(user.organizerProfile.id, adminId, 'REJECTED')

        return { success: true }
    }

    /**
     * Disable organizer
     */
    async disableOrganizer(organizerId: string, adminId: string) {
        const user = await prisma.user.findUnique({
            where: { id: organizerId },
            include: {
                organizerProfile: true
            }
        })

        if (!user || !user.organizerProfile) {
            throw new NotFoundError('Organizer')
        }

        await prisma.user.update({
            where: { id: organizerId },
            data: { role: 'ORGANIZER_UNVERIFIED' }
        })

        // Record as rejection in history
        await approvalRepository.upsertOrganizerApproval(user.organizerProfile.id, adminId, 'REJECTED')

        return { success: true }
    }

    /**
     * Enable organizer
     */
    async enableOrganizer(organizerId: string, adminId: string) {
        const user = await prisma.user.findUnique({
            where: { id: organizerId },
            include: {
                organizerProfile: true
            }
        })

        if (!user || !user.organizerProfile) {
            throw new NotFoundError('Organizer')
        }

        await prisma.user.update({
            where: { id: organizerId },
            data: { role: 'ORGANIZER_VERIFIED' }
        })

        // Record as approval in history
        await approvalRepository.upsertOrganizerApproval(user.organizerProfile.id, adminId, 'APPROVED')

        return { success: true }
    }
}

// Export singleton instance
export const adminOrganizerService = new AdminOrganizerService()
