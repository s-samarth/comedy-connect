import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { useAuth } from '@/lib/hooks/use-auth';

describe('useAuth Hook', () => {
    beforeEach(() => {
        server.resetHandlers();
    });

    it('should return authenticated user', async () => {
        const mockUser = {
            id: 'user-123',
            email: 'test@example.com',
            name: 'Test User',
            role: 'AUDIENCE',
        };

        server.use(
            http.get('*/api/v1/auth/session', () => {
                return HttpResponse.json({ user: mockUser });
            })
        );

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.user).toEqual(mockUser);
        });

        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isLoading).toBe(false);
    });

    it('should return null user when not authenticated', async () => {
        server.use(
            http.get('*/api/v1/auth/session', () => {
                return HttpResponse.json({ user: null }, { status: 401 });
            })
        );

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should provide sign out function', async () => {
        let signOutCalled = false;

        server.use(
            http.post('*/api/v1/auth/signout', () => {
                signOutCalled = true;
                return HttpResponse.json({ success: true });
            })
        );

        const { result } = renderHook(() => useAuth());

        await result.current.signOut();

        await waitFor(() => {
            expect(signOutCalled).toBe(true);
        });
    });

    it('should handle auth errors', async () => {
        server.use(
            http.get('*/api/v1/auth/session', () => {
                return HttpResponse.json(
                    { error: 'Internal Server Error' },
                    { status: 500 }
                );
            })
        );

        const { result } = renderHook(() => useAuth());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBeDefined();
    });
});
