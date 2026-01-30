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
    async findComedianApproval(userId: string) {
        return prisma.comedianApproval.findUnique({
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
     * Find organizer approval by user ID
     */
    async findOrganizerApproval(userId: string) {
        return prisma.organizerApproval.findUnique({
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
     * Upsert comedian approval
     */
    async upsertComedianApproval(
        userId: string,
        data: Omit<Prisma.ComedianApprovalCreateInput, 'user'>
    ) {
        return prisma.comedianApproval.upsert({
            where: { userId },
            create: {
                ...data,
                user: { connect: { id: userId } }
            },
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

    /**
     * Upsert organizer approval
     */
    async upsertOrganizerApproval(
        userId: string,
        data: Omit<Prisma.OrganizerApprovalCreateInput, 'user'>
    ) {
        return prisma.organizerApproval.upsert({
            where: { userId },
            create: {
                ...data,
                user: { connect: { id: userId } }
            },
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

    /**
     * Update comedian approval status
     */
    async updateComedianApprovalStatus(
        userId: string,
        status: 'PENDING' | 'APPROVED' | 'REJECTED',
        adminNote?: string
    ) {
        return prisma.comedianApproval.update({
            where: { userId },
            data: {
                status,
                adminNote,
                approvedAt: status === 'APPROVED' ? new Date() : null
            }
        })
    }

    /**
     * Update organizer approval status
     */
    async updateOrganizerApprovalStatus(
        userId: string,
        status: 'PENDING' | 'APPROVED' | 'REJECTED',
        adminNote?: string
    ) {
        return prisma.organizerApproval.update({
            where: { userId },
            data: {
                status,
                adminNote,
                approvedAt: status === 'APPROVED' ? new Date() : null
            }
        })
    }
}

// Export singleton instance
export const approvalRepository = new ApprovalRepository()
