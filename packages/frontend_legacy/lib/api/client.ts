/**
 * Centralized API Client with Dual-Mode Support
 * 
 * Supports switching between:
 * 1. Legacy mode: Same-origin API calls (monolith)
 * 2. New backend mode: Calls to standalone backend service
 * 
 * Controlled via NEXT_PUBLIC_USE_NEW_BACKEND environment variable
 */

// Determine which backend to use
const USE_NEW_BACKEND = process.env.NEXT_PUBLIC_USE_NEW_BACKEND === 'true'
const BACKEND_URL = USE_NEW_BACKEND
    ? (process.env.NEXT_PUBLIC_BACKEND_URL || '')
    : '' // Empty = same-origin (legacy monolith)

console.log('[API Client] Mode:', USE_NEW_BACKEND ? 'NEW BACKEND' : 'LEGACY MONOLITH')
console.log('[API Client] Backend URL:', BACKEND_URL || 'same-origin')

export interface ApiClientOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    headers?: Record<string, string>
    body?: any
}

class ApiClient {
    private baseUrl: string

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl
    }

    private async request<T>(
        endpoint: string,
        options?: ApiClientOptions
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`

        const fetchOptions: RequestInit = {
            method: options?.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            credentials: 'include', // Send cookies for authentication
        }

        if (options?.body) {
            fetchOptions.body = JSON.stringify(options.body)
        }

        const response = await fetch(url, fetchOptions)

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`API Error: ${response.status} - ${errorText}`)
        }

        return response.json()
    }

    async get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET', headers })
    }

    async post<T>(
        endpoint: string,
        body?: any,
        headers?: Record<string, string>
    ): Promise<T> {
        return this.request<T>(endpoint, { method: 'POST', body, headers })
    }

    async put<T>(
        endpoint: string,
        body?: any,
        headers?: Record<string, string>
    ): Promise<T> {
        return this.request<T>(endpoint, { method: 'PUT', body, headers })
    }

    async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE', headers })
    }
}

// Export singleton instance
export const apiClient = new ApiClient(BACKEND_URL)

// Export convenience methods
export const api = {
    get: <T>(endpoint: string) => apiClient.get<T>(endpoint),
    post: <T>(endpoint: string, body?: any) => apiClient.post<T>(endpoint, body),
    put: <T>(endpoint: string, body?: any) => apiClient.put<T>(endpoint, body),
    delete: <T>(endpoint: string) => apiClient.delete<T>(endpoint),
}
