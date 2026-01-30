import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { useBookings } from '@/lib/hooks/use-bookings';
import { mockBookings } from '../mocks/data/bookings.mock';

describe('useBookings Hook', () => {
    beforeEach(() => {
        server.resetHandlers();
    });

    it('should fetch user bookings', async () => {
        const bookings = mockBookings();

        server.use(
            http.get('*/api/v1/bookings/my-bookings', () => {
                return HttpResponse.json({ bookings });
            })
        );

        const { result } = renderHook(() => useBookings());

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.bookings).toEqual(bookings);
        expect(result.current.error).toBeUndefined();
    });

    it('should handle fetch errors', async () => {
        server.use(
            http.get('*/api/v1/bookings/my-bookings', () => {
                return HttpResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            })
        );

        const { result } = renderHook(() => useBookings());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBeDefined();
        expect(result.current.bookings).toBeUndefined();
    });

    it('should refetch after mutation', async () => {
        let callCount = 0;

        server.use(
            http.get('*/api/v1/bookings/my-bookings', () => {
                callCount++;
                return HttpResponse.json({ bookings: mockBookings() });
            })
        );

        const { result } = renderHook(() => useBookings());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(callCount).toBe(1);

        result.current.mutate();

        await waitFor(() => {
            expect(callCount).toBe(2);
        });
    });
});
