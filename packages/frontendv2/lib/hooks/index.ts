'use client';

import useSWR from 'swr';
import { api } from '../api/client';
import { ShowResponse, BookingResponse, SessionResponse } from '@comedy-connect/types';

export interface User extends NonNullable<SessionResponse['user']> {
    onboardingCompleted?: boolean;
    phone?: string;
    comedianProfile?: {
        stageName: string;
    };
    organizerProfile?: {
        name: string;
    };
}

export interface ExtendedSessionResponse extends SessionResponse {
    user: User | null;
}

/**
 * Custom hook for authentication state
 */
export function useAuth() {
    const { data, error, isLoading, mutate } = useSWR<ExtendedSessionResponse>(
        '/api/auth/session',
        () => api.get<ExtendedSessionResponse>('/api/auth/session')
    );

    const user = data?.user as User | null;

    return {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isOrganizer: user?.role?.startsWith('ORGANIZER'),
        isComedian: user?.role?.startsWith('COMEDIAN'),
        isLoading,
        error,
        mutate,
    };
}

/**
 * Custom hook for fetching shows
 */
export function useShows(mode: 'discovery' | 'manage' | 'public' = 'discovery') {
    const endpoint = `/api/v1/shows?mode=${mode}`;

    const { data, error, isLoading, mutate } = useSWR<{ shows: ShowResponse[] }>(
        endpoint,
        () => api.get<{ shows: ShowResponse[] }>(endpoint)
    );

    return {
        shows: data?.shows || [],
        isLoading,
        error,
        mutate,
    };
}

/**
 * Custom hook for fetching a single show
 */
export function useShow(id: string | null) {
    const { data, error, isLoading, mutate } = useSWR<{ show: ShowResponse }>(
        id ? `/api/v1/shows/${id}` : null,
        (url: string) => api.get<{ show: ShowResponse }>(url)
    );

    return {
        show: data?.show,
        isLoading,
        error,
        mutate,
    };
}

/**
 * Custom hook for fetching user bookings
 */
export function useBookings() {
    const { data, error, isLoading, mutate } = useSWR<{ bookings: BookingResponse[] }>(
        '/api/v1/bookings',
        () => api.get<{ bookings: BookingResponse[] }>('/api/v1/bookings')
    );

    return {
        bookings: data?.bookings || [],
        isLoading,
        error,
        mutate,
    };
}
