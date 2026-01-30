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
                role: { in: ['ORGANIZER', 'ORGANIZER_UNVERIFIED'] }
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

        await prisma.$transaction([
            (prisma.organizerProfile as any).update({
                where: { id: organizerId },
                data: { customPlatformFee: feePercent }
            }),
            (prisma.show as any).updateMany({
                where: { creatorId: organizerId },
                data: { platformFeePercent: feePercent }
            })
        ])

        return { success: true }
    }

    /**
     * Approve organizer
     */
    async approveOrganizer(organizerId: string) {
        const organizer = await prisma.user.findUnique({
            where: { id: organizerId }
        })

        if (!organizer) {
            throw new NotFoundError('Organizer')
        }

        // Update shows
        await prisma.show.updateMany({
            where: {
                creatorId: organizerId,
                isPublished: false
            },
            data: { isPublished: false }
        })

        // Upsert approval
        await prisma.organizerApproval.upsert({
            where: { userId: organizerId },
            create: {
                userId: organizerId,
                status: 'APPROVED',
                approvedAt: new Date()
            } as any,
            update: {
                status: 'APPROVED',
                approvedAt: new Date()
            }
        })

        // Update user role
        await prisma.user.update({
            where: { id: organizerId },
            data: { role: 'ORGANIZER' }
        })

        return { success: true }
    }

    /**
     * Reject organizer
     */
    async rejectOrganizer(organizerId: string, reason?: string) {
        await approvalRepository.upsertOrganizerApproval(organizerId, {
            status: 'REJECTED',
            adminNote: reason
        })

        return { success: true }
    }

    /**
     * Disable organizer
     */
    async disableOrganizer(organizerId: string) {
        await userRepository.updateProfile(organizerId, {
            role: 'ORGANIZER_UNVERIFIED'
        })

        return { success: true }
    }

    /**
     * Enable organizer
     */
    async enableOrganizer(organizerId: string) {
        await userRepository.updateProfile(organizerId, {
            role: 'ORGANIZER'
        })

        return { success: true }
    }
}

// Export singleton instance
export const adminOrganizerService = new AdminOrganizerService()
