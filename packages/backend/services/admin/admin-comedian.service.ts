import { prisma } from "@/lib/prisma"
import { userRepository, approvalRepository } from "@/repositories"
import { ValidationError, NotFoundError } from "@/errors"

/**
 * Admin Comedian Service
 * Handles comedian user management and approvals
 */
class AdminComedianService {
    /**
     * List all comedian users
     */
    async listComedianUsers() {
        const comedians = await prisma.user.findMany({
            where: {
                role: { in: ['COMEDIAN', 'COMEDIAN_UNVERIFIED'] }
            },
            include: {
                comedianProfile: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return { comedians }
    }

    /**
     * Get comedian profiles with fee information
     */
    async getComedianProfiles() {
        const comedians = await prisma.comedianProfile.findMany({
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

        // Get profile fees
        const profileFees = await prisma.$queryRaw`
            SELECT 
                cp.id,
                cp."customPlatformFee"
            FROM "ComedianProfile" cp
        ` as any[]

        const feeMap = new Map(profileFees.map((f: any) => [f.id, f.customPlatformFee]))

        const enrichedComedians = comedians.map((c: any) => ({
            ...c,
            customPlatformFee: feeMap.get(c.id) || null
        }))

        return { comedians: enrichedComedians }
    }

    /**
     * Update custom fee for comedian
     */
    async updateCustomFee(comedianId: string, feePercent: number) {
        if (feePercent < 0 || feePercent > 100) {
            throw new ValidationError('Invalid fee percentage (0-100 required)')
        }

        await prisma.$transaction([
            (prisma.comedianProfile as any).update({
                where: { id: comedianId },
                data: { customPlatformFee: feePercent }
            }),
            (prisma.show as any).updateMany({
                where: { creatorId: comedianId },
                data: { platformFeePercent: feePercent }
            })
        ])

        return { success: true }
    }

    /**
     * Approve comedian
     */
    async approveComedian(comedianId: string) {
        const comedian = await prisma.user.findUnique({
            where: { id: comedianId }
        })

        if (!comedian) {
            throw new NotFoundError('Comedian')
        }

        // Update shows to published if needed
        await prisma.show.updateMany({
            where: {
                creatorId: comedianId,
                isPublished: false
            },
            data: { isPublished: false }
        })

        // Upsert approval
        await prisma.comedianApproval.upsert({
            where: { userId: comedianId },
            create: {
                userId: comedianId,
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
            where: { id: comedianId },
            data: { role: 'COMEDIAN' }
        })

        return { success: true }
    }

    /**
     * Reject comedian
     */
    async rejectComedian(comedianId: string, reason?: string) {
        await approvalRepository.upsertComedianApproval(comedianId, {
            status: 'REJECTED',
            adminNote: reason
        })

        return { success: true }
    }

    /**
     * Disable comedian
     */
    async disableComedian(comedianId: string) {
        await userRepository.updateProfile(comedianId, {
            role: 'COMEDIAN_UNVERIFIED'
        })

        return { success: true }
    }

    /**
     * Enable comedian
     */
    async enableComedian(comedianId: string) {
        await userRepository.updateProfile(comedianId, {
            role: 'COMEDIAN'
        })

        return { success: true }
    }
}

// Export singleton instance
export const adminComedianService = new AdminComedianService()
