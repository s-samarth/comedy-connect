import { platformConfigRepository } from "@/repositories"
import { ValidationError } from "@/errors"

/**
 * Admin Fees Service
 * Handles platform fee configuration
 */
class AdminFeesService {
    /**
     * Get current platform configuration
     */
    async getPlatformConfig() {
        let config = await platformConfigRepository.get()

        if (!config) {
            // Create default config if doesn't exist
            config = await platformConfigRepository.upsert({
                platformFeePercent: 10,
                feeSlabs: []
            })
        }

        return { config: config.value }
    }

    /**
     * Update fee slabs
     */
    async updateFeeSlabs(slabs: any[]) {
        if (!Array.isArray(slabs)) {
            throw new ValidationError('Fee slabs must be an array')
        }

        const config = await platformConfigRepository.upsert({
            platformFeePercent: 10, // Keep default for now or fetch existing
            feeSlabs: slabs
        })

        return { success: true, config: config.value }
    }
}

// Export singleton instance
export const adminFeesService = new AdminFeesService()
