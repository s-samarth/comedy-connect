import { prisma } from "@/lib/prisma"

export class UserRepository {
    /**
     * Find user by ID
     */
    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id }
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
}

export const userRepository = new UserRepository()
