// Show Types
export interface CreateShowRequest {
    title: string
    description?: string
    date: string // ISO 8601
    venue: string
    googleMapsLink: string
    ticketPrice: number
    totalTickets: number
    posterImageUrl?: string
    youtubeUrls?: string[]
    instagramUrls?: string[]
}

export interface ShowResponse {
    id: string
    title: string
    description: string | null
    date: string
    venue: string
    googleMapsLink: string
    ticketPrice: number
    totalTickets: number
    posterImageUrl: string | null
    isPublished: boolean
    isDisbursed: boolean
    customPlatformFee: number | null
    youtubeUrls: string[]
    instagramUrls: string[]
    creator: {
        email: string
        role: string
    }
    showComedians: {
        comedian: {
            id: string
            name: string
            bio: string | null
            profileImageUrl: string | null
        }
    }[]
    ticketInventory: {
        available: number
    } | null
    _count: {
        bookings: number
    }
}
