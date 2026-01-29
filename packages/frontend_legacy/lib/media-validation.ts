/**
 * Media URL Validation Utilities
 * 
 * Provides validation for YouTube and Instagram URLs to ensure
 * only valid platform links are stored in the database.
 */

export interface MediaValidationResult {
    valid: boolean
    errors: string[]
}

/**
 * Validates a YouTube URL
 * Accepts formats: youtube.com/watch, youtu.be/, youtube.com/embed
 */
export function validateYouTubeUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false

    try {
        const urlObj = new URL(url)
        const hostname = urlObj.hostname.toLowerCase()

        // Check for valid YouTube domains
        const validDomains = ['youtube.com', 'www.youtube.com', 'youtu.be', 'm.youtube.com']
        if (!validDomains.includes(hostname)) return false

        // For youtube.com, check for valid paths
        if (hostname.includes('youtube.com')) {
            const validPaths = ['/watch', '/embed', '/shorts']
            const hasValidPath = validPaths.some(path => urlObj.pathname.startsWith(path))
            if (!hasValidPath) return false
        }

        return true
    } catch (error) {
        return false
    }
}

/**
 * Validates an Instagram URL
 * Accepts formats: instagram.com/p/, instagram.com/reel/
 */
export function validateInstagramUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false

    try {
        const urlObj = new URL(url)
        const hostname = urlObj.hostname.toLowerCase()

        // Check for valid Instagram domains
        const validDomains = ['instagram.com', 'www.instagram.com']
        if (!validDomains.includes(hostname)) return false

        // Check for valid paths (posts or reels)
        const validPaths = ['/p/', '/reel/', '/reels/']
        const hasValidPath = validPaths.some(path => urlObj.pathname.startsWith(path))

        return hasValidPath
    } catch (error) {
        return false
    }
}

/**
 * Validates arrays of YouTube and Instagram URLs
 * Returns validation result with detailed error messages
 */
export function validateMediaUrls(
    youtubeUrls: string[] = [],
    instagramUrls: string[] = []
): MediaValidationResult {
    const errors: string[] = []

    // Validate YouTube URLs
    if (youtubeUrls && Array.isArray(youtubeUrls)) {
        youtubeUrls.forEach((url, index) => {
            if (url && !validateYouTubeUrl(url)) {
                errors.push(`Invalid YouTube URL at position ${index + 1}: ${url}`)
            }
        })
    }

    // Validate Instagram URLs
    if (instagramUrls && Array.isArray(instagramUrls)) {
        instagramUrls.forEach((url, index) => {
            if (url && !validateInstagramUrl(url)) {
                errors.push(`Invalid Instagram URL at position ${index + 1}: ${url}`)
            }
        })
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

/**
 * Sanitizes media URL arrays by removing empty strings and trimming whitespace
 */
export function sanitizeMediaUrls(urls: string[]): string[] {
    if (!Array.isArray(urls)) return []
    return urls
        .map(url => url?.trim())
        .filter(url => url && url.length > 0)
}
