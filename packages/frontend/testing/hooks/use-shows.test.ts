import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { useShows } from '@/lib/hooks/use-shows';
import { mockShows } from '../mocks/data/shows.mock';

describe('useShows Hook', () => {
    beforeEach(() => {
        server.resetHandlers();
    });

    it('should fetch shows successfully', async () => {
        const shows = mockShows();

        server.use(
            http.get('*/api/v1/shows', () => {
                return HttpResponse.json({ shows });
            })
        );

        const { result } = renderHook(() => useShows());

        // Initially loading
        expect(result.current.isLoading).toBe(true);
        expect(result.current.shows).toBeUndefined();

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.shows).toEqual(shows);
        expect(result.current.error).toBeUndefined();
    });

    it('should handle fetch errors', async () => {
        server.use(
            http.get('*/api/v1/shows', () => {
                return HttpResponse.json(
                    { error: 'Internal Server Error' },
                    { status: 500 }
                );
            })
        );

        const { result } = renderHook(() => useShows());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBeDefined();
        expect(result.current.shows).toBeUndefined();
    });

    it('should filter shows by city', async () => {
        const shows = mockShows();
        const hyderabadShows = shows.filter(s => s.city === 'Hyderabad');

        server.use(
            http.get('*/api/v1/shows', ({ request }) => {
                const url = new URL(request.url);
                const city = url.searchParams.get('city');

                if (city === 'Hyderabad') {
                    return HttpResponse.json({ shows: hyderabadShows });
                }
                return HttpResponse.json({ shows });
            })
        );

        const { result } = renderHook(() => useShows({ city: 'Hyderabad' }));

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.shows).toEqual(hyderabadShows);
    });

    it('should refetch on mutation', async () => {
        let callCount = 0;

        server.use(
            http.get('*/api/v1/shows', () => {
                callCount++;
                return HttpResponse.json({ shows: mockShows() });
            })
        );

        const { result } = renderHook(() => useShows());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(callCount).toBe(1);

        // Trigger refetch
        result.current.mutate();

        await waitFor(() => {
            expect(callCount).toBe(2);
        });
    });

    it('should cache data with SWR', async () => {
        let callCount = 0;

        server.use(
            http.get('*/api/v1/shows', () => {
                callCount++;
                return HttpResponse.json({ shows: mockShows() });
            })
        );

        const { result: result1 } = renderHook(() => useShows());
        await waitFor(() => expect(result1.current.isLoading).toBe(false));

        // Second hook instance should use cache
        const { result: result2 } = renderHook(() => useShows());

        // Should have data immediately from cache
        expect(result2.current.shows).toBeDefined();

        // Should not trigger another API call immediately
        expect(callCount).toBe(1);
    });
});
