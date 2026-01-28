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
    durationMinutes: number | null
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

// Booking Types
export interface CreateBookingRequest {
    showId: string
    quantity: number
}

export interface BookingResponse {
    id: string
    show: {
        id: string
        title: string
        date: string
        venue: string
        ticketPrice: number
    }
    quantity: number
    totalAmount: number
    platformFee: number
    bookingFee: number
    status: 'PENDING' | 'CONFIRMED' | 'CONFIRMED_UNPAID' | 'CANCELLED' | 'FAILED'
}

// Auth Types
export interface SessionResponse {
    user: {
        id: string
        email: string
        name: string | null
        image: string | null
        role: string
    } | null
}

// Generic API Response
export interface ApiResponse<T> {
    success?: boolean
    data?: T
    error?: string
    message?: string
}

// Error Response
export interface ApiError {
    success: false
    error: string
    code?: string
    details?: Record<string, unknown>
}
