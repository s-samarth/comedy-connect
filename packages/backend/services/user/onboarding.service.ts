import { prisma } from "@/lib/prisma"
import { ValidationError } from "@/errors"

/**
 * Onboarding Service
 * Handles user onboarding flow
 */
class OnboardingService {
    /**
     * Complete user onboarding
     */
    async completeOnboarding(userEmail: string, data: any) {
        const { name, age, city, watchedComedy, phone, heardAboutUs, bio } = data

        // Validation
        if (!name || !age || !city || !watchedComedy) {
            throw new ValidationError('Missing required fields: name, age, city, and watchedComedy are required')
        }

        if (isNaN(Number(age)) || Number(age) < 1 || Number(age) > 120) {
            throw new ValidationError('Age must be a valid number between 1 and 120')
        }

        if (!['yes', 'no'].includes(watchedComedy)) {
            throw new ValidationError('watchedComedy must be either "yes" or "no"')
        }

        // Update user
        await prisma.user.update({
            where: { email: userEmail },
            data: {
                name: name.trim(),
                age: Number(age),
                city: city.trim(),
                phone: phone?.trim() || null,
                heardAboutUs: heardAboutUs?.trim() || null,
                bio: bio?.trim() || null,
                onboardingCompleted: true,
                updatedAt: new Date()
            }
        })

        const updatedUser = await prisma.user.findUnique({
            where: { email: userEmail },
            select: {
                id: true,
                email: true,
                name: true,
                onboardingCompleted: true
            }
        })

        return {
            success: true,
            message: 'Onboarding completed successfully',
            user: updatedUser
        }
    }
}

// Export singleton instance
export const onboardingService = new OnboardingService()
