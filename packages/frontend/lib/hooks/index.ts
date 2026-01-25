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
    const endpoint = mode ? `/api/shows?mode=${mode}` : '/api/shows'

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
        id ? `/api/shows/${id}` : null,
        () => id ? api.get<{ show: any }>(`/api/shows/${id}`) : null
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
        '/api/bookings',
        () => api.get<{ bookings: any[] }>('/api/bookings')
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
        '/api/comedians',
        () => api.get<{ comedians: any[] }>('/api/comedians')
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
        '/api/organizer/profile',
        () => api.get<{ profile: any }>('/api/organizer/profile')
    )

    return {
        profile: data?.profile,
        isLoading,
        error,
        mutate,
    }
}
