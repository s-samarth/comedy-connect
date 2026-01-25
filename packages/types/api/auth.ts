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
