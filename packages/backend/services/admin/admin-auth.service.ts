import { prisma } from "@/lib/prisma"
import { verifyAdminPassword, hashAdminPassword, createAdminSessionCookie, isAdminEmailWhitelisted } from "@/lib/admin-password"
import { userRepository } from "@/repositories"
import { ValidationError, UnauthorizedError } from "@/errors"

/**
 * Admin Authentication Service
 * Handles all admin authentication logic (login, setup, password management)
 */
class AdminAuthService {
    /**
     * Admin login
     */
    async login(email: string, password: string) {
        // Validate inputs
        if (!email || !password) {
            throw new ValidationError('Email and password required')
        }

        // Check whitelist
        if (!isAdminEmailWhitelisted(email)) {
            throw new UnauthorizedError('Unauthorized email')
        }

        // Find user
        const user = await userRepository.findByEmail(email)

        if (!user || user.role !== 'ADMIN') {
            throw new UnauthorizedError('Restricted access')
        }

        // Check if password set
        if (!user.adminPasswordHash) {
            throw new ValidationError('Setup required')
        }

        // Verify password
        const isValid = await verifyAdminPassword(password, user.adminPasswordHash)
        if (!isValid) {
            throw new UnauthorizedError('Invalid credentials')
        }

        // Create session cookie
        const sessionCookie = await createAdminSessionCookie(email)

        return { success: true, sessionCookie }
    }

    /**
     * Admin setup (one-time password creation)
     */
    async setup(email: string, password: string) {
        // Validate inputs
        if (!email || !password) {
            throw new ValidationError('Email and password required')
        }

        if (password.length < 8) {
            throw new ValidationError('Password must be at least 8 characters')
        }

        // Check whitelist
        if (!isAdminEmailWhitelisted(email)) {
            throw new UnauthorizedError('Unauthorized email')
        }

        // Hash password
        const hashedPassword = await hashAdminPassword(password)

        // Create or update admin user
        const user = await prisma.user.upsert({
            where: { email },
            create: {
                email,
                role: 'ADMIN',
                adminPasswordHash: hashedPassword,
                onboardingCompleted: true
            },
            update: {
                adminPasswordHash: hashedPassword
            }
        })

        // Create session
        const sessionCookie = await createAdminSessionCookie(email)

        return { success: true, sessionCookie }
    }

    /**
     * Set admin password (for already authenticated admin)
     */
    async setPassword(email: string, password: string, confirmPassword: string) {
        if (!password || !confirmPassword) {
            throw new ValidationError('Both passwords required')
        }

        if (password.length < 8) {
            throw new ValidationError('Password must be at least 8 characters')
        }

        if (password !== confirmPassword) {
            throw new ValidationError('Passwords do not match')
        }

        const hashedPassword = await hashAdminPassword(password)

        await prisma.user.update({
            where: { email },
            data: { adminPasswordHash: hashedPassword }
        })

        // Create session cookie after setting password
        const sessionCookie = await createAdminSessionCookie(email)

        return { success: true, sessionCookie }
    }

    /**
     * Reset admin password
     */
    async resetPassword(email: string, password: string) {
        if (!password) {
            throw new ValidationError('Password required')
        }

        if (password.length < 8) {
            throw new ValidationError('Password must be at least 8 characters')
        }

        const hashedPassword = await hashAdminPassword(password)

        await prisma.user.update({
            where: { email },
            data: { adminPasswordHash: hashedPassword }
        })

        return { success: true }
    }
}

// Export singleton instance
export const adminAuthService = new AdminAuthService()
