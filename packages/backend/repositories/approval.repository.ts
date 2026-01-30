import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

/**
 * Approval Repository
 * Handles all database operations related to comedian and organizer approval workflows
 */
export class ApprovalRepository {
    /**
     * Find comedian approval by user ID
     */
    async findComedianApproval(comedianId: string) {
        return prisma.comedianApproval.findFirst({
            where: { comedianId },
            include: {
                comedian: {
                    include: {
                        user: true
                    }
                }
            }
        })
    }

    /**
     * Find organizer approval by user ID
     */
    async findOrganizerApproval(organizerId: string) {
        return prisma.organizerApproval.findFirst({
            where: { organizerId },
            include: {
                organizer: {
                    include: {
                        user: true
                    }
                }
            }
        })
    }

    /**
     * Upsert comedian approval
     */
    async upsertComedianApproval(
        comedianId: string,
        adminId: string,
        status: 'PENDING' | 'APPROVED' | 'REJECTED'
    ) {
        return prisma.comedianApproval.upsert({
            where: {
                comedianId_adminId: {
                    comedianId,
                    adminId
                }
            },
            create: {
                comedianId,
                adminId,
                status
            },
            update: {
                status
            }
        })
    }

    /**
     * Upsert organizer approval
     */
    async upsertOrganizerApproval(
        organizerId: string,
        adminId: string,
        status: 'PENDING' | 'APPROVED' | 'REJECTED'
    ) {
        return prisma.organizerApproval.upsert({
            where: {
                organizerId_adminId: {
                    organizerId,
                    adminId
                }
            },
            create: {
                organizerId,
                adminId,
                status
            },
            update: {
                status
            }
        })
    }

    /**
     * Update comedian approval status
     */
    async updateComedianApprovalStatus(
        comedianId: string,
        adminId: string,
        status: 'PENDING' | 'APPROVED' | 'REJECTED'
    ) {
        return prisma.comedianApproval.update({
            where: {
                comedianId_adminId: {
                    comedianId,
                    adminId
                }
            },
            data: {
                status
            }
        })
    }

    /**
     * Update organizer approval status
     */
    async updateOrganizerApprovalStatus(
        organizerId: string,
        adminId: string,
        status: 'PENDING' | 'APPROVED' | 'REJECTED'
    ) {
        return prisma.organizerApproval.update({
            where: {
                organizerId_adminId: {
                    organizerId,
                    adminId
                }
            },
            data: {
                status
            }
        })
    }
}

// Export singleton instance
export const approvalRepository = new ApprovalRepository()
