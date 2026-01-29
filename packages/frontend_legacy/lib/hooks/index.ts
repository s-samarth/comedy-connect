'use client'

import useSWR from 'swr'
import { api } from '../api/client'

/**
 * Custom hook for authentication state
 */
export function useAuth() {
    const { data, error, isLoading, mutate } = useSWR(
        '/api/auth/session',
        () => api.get<{ user: any }>('/api/auth/session')
    )

    return {
        user: data?.user,
        isAuthenticated: !!data?.user,
        isAdmin: data?.user?.role === 'ADMIN',
        isOrganizer: data?.user?.role?.startsWith('ORGANIZER'),
        isComedian: data?.user?.role?.startsWith('COMEDIAN'),
        isLoading,
        error,
        mutate, // For refreshing auth state
    }
}

/**
 * Custom hook for fetching shows
 */
export function useShows(mode?: 'discovery' | 'manage' | 'public') {
    const endpoint = mode ? `/api/v1/shows?mode=${mode}` : '/api/v1/shows'

    const { data, error, isLoading, mutate } = useSWR(
        endpoint,
        () => api.get<{ shows: any[], isMockData?: boolean }>(endpoint)
    )

    return {
        shows: data?.shows || [],
        isMockData: data?.isMockData,
        isLoading,
        error,
        mutate,
    }
}

/**
 * Custom hook for fetching a single show
 */
export function useShow(id: string | null) {
    const { data, error, isLoading, mutate } = useSWR(
        id ? `/api/v1/shows/${id}` : null,
        () => id ? api.get<{ show: any }>(`/api/v1/shows/${id}`) : null
    )

    return {
        show: data?.show,
        isLoading,
        error,
        mutate,
    }
}

/**
 * Custom hook for fetching user bookings
 */
export function useBookings() {
    const { data, error, isLoading, mutate } = useSWR(
        '/api/v1/bookings',
        () => api.get<{ bookings: any[] }>('/api/v1/bookings')
    )

    return {
        bookings: data?.bookings || [],
        isLoading,
        error,
        mutate,
    }
}

/**
 * Custom hook for fetching comedians
 */
export function useComedians() {
    const { data, error, isLoading, mutate } = useSWR(
        '/api/v1/comedians',
        () => api.get<{ comedians: any[] }>('/api/v1/comedians')
    )

    return {
        comedians: data?.comedians || [],
        isLoading,
        error,
        mutate,
    }
}

/**
 * Custom hook for organizer profile
 */
export function useOrganizerProfile() {
    const { data, error, isLoading, mutate } = useSWR(
        '/api/v1/organizer/profile',
        () => api.get<{ profile: any }>('/api/v1/organizer/profile')
    )

    return {
        profile: data?.profile,
        isLoading,
        error,
        mutate,
    }
}
