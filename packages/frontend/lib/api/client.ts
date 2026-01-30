import { ApiError } from '../errors';

/**
 * Backend URL configuration
 * - In development: relies on Next.js rewrites (/api/* -> backend)
 * - In production: should be set via NEXT_PUBLIC_BACKEND_URL environment variable
 */
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

// Log configuration in development for debugging
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    console.log('[API Client] Backend URL:', BACKEND_URL || '(using Next.js rewrites)');
}

export interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    headers?: Record<string, string>;
    cache?: RequestCache;
    next?: NextFetchRequestConfig;
}

class ApiClient {
    /**
     * Make an HTTP request to the backend API
     * @throws {ApiError} When the request fails
     */
    private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        const url = `${BACKEND_URL}${endpoint}`;

        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                body: options.body ? JSON.stringify(options.body) : undefined,
                credentials: 'include',
                cache: options.cache,
                next: options.next,
            });

            // Handle non-OK responses
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                throw new ApiError(
                    errorData.error || errorData.message || `Request failed`,
                    response.status,
                    errorData.code,
                    errorData
                );
            }

            return response.json();
        } catch (error) {
            // Re-throw ApiError instances
            if (error instanceof ApiError) {
                throw error;
            }

            // Handle network errors and other exceptions
            throw new ApiError(
                error instanceof Error ? error.message : 'Network error occurred',
                0, // Status 0 indicates network/client-side error
                'NETWORK_ERROR'
            );
        }
    }

    /**
     * Perform a GET request
     */
    get<T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    /**
     * Perform a POST request
     */
    post<T>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>) {
        return this.request<T>(endpoint, { ...options, method: 'POST', body });
    }

    /**
     * Perform a PUT request
     */
    put<T>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>) {
        return this.request<T>(endpoint, { ...options, method: 'PUT', body });
    }

    /**
     * Perform a PATCH request
     */
    patch<T>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>) {
        return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
    }

    /**
     * Perform a DELETE request
     */
    delete<T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const api = new ApiClient();
