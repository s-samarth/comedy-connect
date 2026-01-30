'use client';

import useSWR from 'swr';
import { api } from '../api/client';
import {
    ShowResponse,
    BookingResponse,
    SessionResponse,
    UserRole,
} from '@comedy-connect/types';
import { normalizeError } from '../errors';

/**
 * Extended user type that matches the backend session response.
 * The backend enriches the base User type with additional fields.
 * This type should stay in sync with what /api/auth/session actually returns.
 */
export interface ExtendedUser extends NonNullable<SessionResponse['user']> {
    onboardingCompleted?: boolean;
    phone?: string;
    age?: number;
    city?: string;
    comedianProfile?: {
        stageName: string;
    };
    organizerProfile?: {
        name: string;
    };
}

/**
 * Custom hook for authentication state
 * Uses SWR to fetch and cache the current user session
 */
export function useAuth() {
    const { data, error, isLoading, mutate } = useSWR<SessionResponse>(
        '/api/auth/session',
        () => api.get<SessionResponse>('/api/auth/session')
    );

    const user = data?.user as ExtendedUser | null;

    return {
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === UserRole.ADMIN,
        isOrganizer: user?.role === UserRole.ORGANIZER_VERIFIED ||
            user?.role === UserRole.ORGANIZER_UNVERIFIED,
        isOrganizerVerified: user?.role === UserRole.ORGANIZER_VERIFIED,
        isComedian: user?.role === UserRole.COMEDIAN_VERIFIED ||
            user?.role === UserRole.COMEDIAN_UNVERIFIED,
        isComedianVerified: user?.role === UserRole.COMEDIAN_VERIFIED,
        isLoading,
        error: normalizeError(error),
        mutate,
    };
}

/**
 * Custom hook for fetching shows
 * @param mode - 'discovery' for public shows, 'manage' for creator's shows, 'public' for all public shows
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
        error: normalizeError(error),
        mutate,
    };
}

/**
 * Custom hook for fetching a single show
 * @param id - Show ID, or null to skip fetching
 */
export function useShow(id: string | null) {
    const { data, error, isLoading, mutate } = useSWR<{ show: ShowResponse }>(
        id ? `/api/v1/shows/${id}` : null,
        (url: string) => api.get<{ show: ShowResponse }>(url)
    );

    return {
        show: data?.show,
        isLoading,
        error: normalizeError(error),
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
        error: normalizeError(error),
        mutate,
    };
}

/**
 * Custom hook for fetching a single booking
 * @param id - Booking ID, or null to skip fetching
 */
export function useBooking(id: string | null) {
    const { data, error, isLoading, mutate } = useSWR<{ booking: BookingResponse }>(
        id ? `/api/v1/bookings/${id}` : null,
        (url: string) => api.get<{ booking: BookingResponse }>(url)
    );

    return {
        booking: data?.booking,
        isLoading,
        error: normalizeError(error),
        mutate,
    };
}

/**
 * Custom hook for fetching sales reports (for Comedians & Organizers)
 */
export function useSales() {
    const { data, error, isLoading, mutate } = useSWR<{ shows: any[] }>(
        '/api/v1/organizer/sales',
        () => api.get<{ shows: any[] }>('/api/v1/organizer/sales')
    );

    return {
        sales: data?.shows || [],
        isLoading,
        error: normalizeError(error),
        mutate,
    };
}
