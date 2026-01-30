import { prisma } from "@/lib/prisma"

export class UserRepository {
    /**
     * Find user by ID
     */
    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            include: {
                comedianProfile: true,
                organizerProfile: true
            }
        })
    }

    /**
     * Find user by Email
     */
    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email }
        })
    }

    /**
     * Find user by Email with specific role (for admin checks)
     */
    async findByEmailWithRole(email: string) {
        return prisma.user.findUnique({
            where: { email }
        })
    }

    /**
     * Find multiple users with specific role and optional filtering
     */
    async findManyWithRole(role: string, where?: any) {
        return prisma.user.findMany({
            where: {
                role,
                ...where
            },
            include: {
                comedianProfile: true,
                organizerProfile: true
            }
        })
    }

    /**
     * Update user profile information
     */
    async updateProfile(userId: string, data: any) {
        return prisma.user.update({
            where: { id: userId },
            data,
            include: {
                comedianProfile: true,
                organizerProfile: true
            }
        })
    }

    /**
     * Delete user account with cascade (sessions, bookings, shows)
     * Should be called within a transaction
     */
    async deleteWithTransaction(userId: string, tx: any) {
        // Delete in order to respect foreign key constraints

        // 1. Delete all sessions
        await tx.session.deleteMany({
            where: { userId }
        })

        // 2. Delete all bookings
        await tx.booking.deleteMany({
            where: { userId }
        })

        // 3. Delete owned shows (cascade will handle ticketInventory, showComedians)
        await tx.show.deleteMany({
            where: { creatorId: userId }
        })

        // 4. Delete comedian profile if exists
        await tx.comedianProfile.deleteMany({
            where: { userId }
        })

        // 5. Delete organizer profile if exists
        await tx.organizerProfile.deleteMany({
            where: { userId }
        })

        // 6. Delete comedian approval if exists
        await tx.comedianApproval.deleteMany({
            where: { userId }
        })

        // 7. Delete organizer approval if exists
        await tx.organizerApproval.deleteMany({
            where: { userId }
        })

        // 8. Finally delete the user
        await tx.user.delete({
            where: { id: userId }
        })
    }

    /**
     * Count users with optional filtering
     */
    async count(where?: any) {
        return prisma.user.count({ where })
    }
}

export const userRepository = new UserRepository()
