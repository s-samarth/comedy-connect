import { ApiResponse } from '@comedy-connect/types';

const BACKEND_URL = '';

export interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    cache?: RequestCache;
    next?: NextFetchRequestConfig;
}

class ApiClient {
    private async request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
        const url = `${BACKEND_URL}${endpoint}`;

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

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
            throw new Error(errorData.error || `API Error: ${response.status}`);
        }

        return response.json();
    }

    get<T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    post<T>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>) {
        return this.request<T>(endpoint, { ...options, method: 'POST', body });
    }

    put<T>(endpoint: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>) {
        return this.request<T>(endpoint, { ...options, method: 'PUT', body });
    }

    delete<T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>) {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const api = new ApiClient();
