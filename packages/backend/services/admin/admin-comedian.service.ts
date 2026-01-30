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
                role: { in: ['COMEDIAN_VERIFIED', 'COMEDIAN_UNVERIFIED'] }
            },
            include: {
                comedianProfile: {
                    include: {
                        approvals: {
                            include: {
                                admin: {
                                    select: { email: true }
                                }
                            },
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }
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

        // Update the comedian profile fee
        await prisma.comedianProfile.update({
            where: { userId: comedianId },
            data: { customPlatformFee: feePercent }
        })

        return { success: true }
    }

    /**
     * Approve comedian
     */
    async approveComedian(comedianId: string) {
        const user = await prisma.user.findUnique({
            where: { id: comedianId },
            include: {
                comedianProfile: true
            }
        })

        if (!user || !user.comedianProfile) {
            throw new NotFoundError('Comedian')
        }

        // Update user role to verified
        await prisma.user.update({
            where: { id: comedianId },
            data: { role: 'COMEDIAN_VERIFIED' }
        })

        return { success: true }
    }

    /**
     * Reject comedian
     */
    async rejectComedian(comedianId: string, reason?: string) {
        // Just update the user role back to unverified
        await prisma.user.update({
            where: { id: comedianId },
            data: { role: 'COMEDIAN_UNVERIFIED' }
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
            role: 'COMEDIAN_VERIFIED'
        })

        return { success: true }
    }
}

// Export singleton instance
export const adminComedianService = new AdminComedianService()
