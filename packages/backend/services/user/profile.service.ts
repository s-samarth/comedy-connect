import { prisma } from "@/lib/prisma"
import { userRepository } from "@/repositories"
import { ValidationError, NotFoundError } from "@/errors"

/**
 * Profile Service
 * Handles user profile operations (update, delete, status)
 */
class ProfileService {
    /**
     * Get user onboarding status
     */
    async getOnboardingStatus(userId: string) {
        const userProfile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                onboardingCompleted: true,
                role: true
            }
        })

        if (!userProfile) {
            throw new NotFoundError('User')
        }

        return {
            onboardingCompleted: userProfile.onboardingCompleted,
            role: userProfile.role
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(userId: string, data: any) {
        const { name, youtubeUrls, instagramUrls, bio, city, phone } = data

        // Validate YouTube URLs limit
        if (youtubeUrls && youtubeUrls.length > 1) {
            throw new ValidationError('Limit reached: Maximum 1 YouTube video is allowed.')
        }

        // Validate Instagram URLs limit
        if (instagramUrls && instagramUrls.length > 2) {
            throw new ValidationError('Limit reached: Maximum 2 Instagram reels are allowed.')
        }

        // Update basic user info
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: name?.trim(),
                city: city?.trim(),
                phone: phone?.trim(),
                updatedAt: new Date()
            }
        })

        // Get admin for approval checks
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        })

        const user = await userRepository.findById(userId)

        // Update comedian profile if applicable
        if (user?.role === 'COMEDIAN' || user?.role === 'COMEDIAN_UNVERIFIED') {
            const comedianProfile = await prisma.comedianProfile.upsert({
                where: { userId },
                create: {
                    userId,
                    name: name || '',
                    bio: bio || '',
                    youtubeUrls: youtubeUrls || [],
                    instagramUrls: instagramUrls || []
                } as any,
                update: {
                    name: name || undefined,
                    bio: bio || undefined,
                    youtubeUrls: youtubeUrls || undefined,
                    instagramUrls: instagramUrls || undefined,
                    updatedAt: new Date()
                }
            })

            // Create approval request if unverified
            if (user.role === 'COMEDIAN_UNVERIFIED') {
                await prisma.comedianApproval.upsert({
                    where: { userId },
                    create: {
                        userId,
                        status: 'PENDING'
                    } as any,
                    update: {
                        status: 'PENDING',
                        updatedAt: new Date()
                    }
                })
            }
        }

        // Update organizer profile if applicable
        if (user?.role === 'ORGANIZER' || user?.role === 'ORGANIZER_UNVERIFIED') {
            const organizationData = data.organizationData
            if (organizationData) {
                const organizerProfile = await prisma.organizerProfile.upsert({
                    where: { userId },
                    create: {
                        userId,
                        organizationName: organizationData.organizationName || '',
                        organizationType: organizationData.organizationType || 'COMPANY',
                        registrationNumber: organizationData.registrationNumber || '',
                        address: organizationData.address || '',
                        contactNumber: organizationData.contactNumber || '',
                        website: organizationData.website || ''
                    } as any,
                    update: {
                        organizationName: organizationData.organizationName,
                        organizationType: organizationData.organizationType,
                        registrationNumber: organizationData.registrationNumber,
                        address: organizationData.address,
                        contactNumber: organizationData.contactNumber,
                        website: organizationData.website,
                        updatedAt: new Date()
                    }
                })

                // Create approval request if unverified
                if (user.role === 'ORGANIZER_UNVERIFIED') {
                    await prisma.organizerApproval.upsert({
                        where: { userId },
                        create: {
                            userId,
                            status: 'PENDING'
                        } as any,
                        update: {
                            status: 'PENDING',
                            updatedAt: new Date()
                        }
                    })
                }
            }
        }

        return { success: true, message: 'Profile updated successfully' }
    }

    /**
     * Delete user account
     */
    async deleteAccount(userId: string, userRole: string) {
        // Admins cannot delete themselves
        if (userRole === 'ADMIN') {
            throw new ValidationError('Admin users cannot be deleted')
        }

        // Check for active shows (for verified creators)
        if (userRole === 'COMEDIAN' || userRole === 'ORGANIZER') {
            const activeShow = await prisma.show.findFirst({
                where: {
                    creatorId: userId,
                    isPublished: true,
                    date: { gte: new Date() }
                }
            })

            if (activeShow) {
                throw new ValidationError(
                    'Cannot delete account with active published shows. Please unpublish or cancel your shows first.'
                )
            }

            // Check for shows with bookings
            const showsWithBookings = await prisma.show.findFirst({
                where: {
                    creatorId: userId,
                    bookings: {
                        some: {
                            status: { in: ['CONFIRMED', 'CONFIRMED_UNPAID'] }
                        }
                    }
                }
            })

            if (showsWithBookings) {
                throw new ValidationError(
                    'Cannot delete account with shows that have active bookings. Please contact admin.'
                )
            }
        }

        // Perform cascade delete in transaction
        await prisma.$transaction(async (tx) => {
            await userRepository.deleteWithTransaction(userId, tx)
        })

        return { success: true, message: 'Account deleted successfully' }
    }
}

// Export singleton instance
export const profileService = new ProfileService()
