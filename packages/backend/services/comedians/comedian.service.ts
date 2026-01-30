import { comedianRepository } from "@/repositories"
import { ValidationError } from "@/errors"

/**
 * Comedian Service
 * Handles comedian-specific operations
 */
class ComedianService {
    /**
     * List all comedians
     */
    async listComedians() {
        const comedians = await comedianRepository.findMany()
        return { comedians }
    }

    /**
     * Get comedian by ID
     */
    async getComedianById(id: string) {
        const comedian = await comedianRepository.findById(id)
        return { comedian }
    }

    /**
     * Get comedian by user ID
     */
    async getComedianByUserId(userId: string) {
        const comedian = await comedianRepository.findByUserId(userId)
        return { comedian }
    }

    /**
     * Create comedian profile
     */
    async createComedianProfile(userId: string, data: any) {
        if (!data.name) {
            throw new ValidationError('Stage name is required')
        }

        const comedian = await comedianRepository.create({
            user: { connect: { id: userId } },
            name: data.name,
            bio: data.bio || '',
            profileImageUrl: data.profileImageUrl,
            youtubeUrls: data.youtubeUrls || [],
            instagramUrls: data.instagramUrls || []
        } as any)

        return { comedian }
    }

    /**
     * Update comedian profile
     */
    async updateComedianProfile(userId: string, data: any) {
        const profile = await comedianRepository.findByUserId(userId)

        if (!profile) {
            // Create if doesn't exist
            return this.createComedianProfile(userId, data)
        }

        const updated = await comedianRepository.update(profile.id, {
            name: data.name,
            bio: data.bio,
            profileImageUrl: data.profileImageUrl,
            youtubeUrls: data.youtubeUrls,
            instagramUrls: data.instagramUrls
        })

        return { comedian: updated }
    }
}

// Export singleton instance
export const comedianService = new ComedianService()
