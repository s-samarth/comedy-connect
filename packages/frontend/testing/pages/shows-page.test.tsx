import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ShowsPage } from '@/app/shows/page';
import { mockShows } from '../mocks/data/shows.mock';

describe('Shows Page - Integration Test', () => {
    beforeEach(() => {
        server.resetHandlers();
    });

    it('should display list of shows', async () => {
        const shows = mockShows();

        server.use(
            http.get('*/api/v1/shows', () => {
                return HttpResponse.json({ shows });
            })
        );

        render(<ShowsPage />);

        await waitFor(() => {
            expect(screen.getByText(shows[0].title)).toBeInTheDocument();
        });

        expect(screen.getByText(shows[1].title)).toBeInTheDocument();
        expect(screen.getByText(shows[2].title)).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
        render(<ShowsPage />);

        expect(screen.getByTestId('loading-spinner') || screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should show error state on fetch failure', async () => {
        server.use(
            http.get('*/api/v1/shows', () => {
                return HttpResponse.json(
                    { error: 'Internal Server Error' },
                    { status: 500 }
                );
            })
        );

        render(<ShowsPage />);

        await waitFor(() => {
            expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
        });
    });

    it('should show empty state when no shows', async () => {
        server.use(
            http.get('*/api/v1/shows', () => {
                return HttpResponse.json({ shows: [] });
            })
        );

        render(<ShowsPage />);

        await waitFor(() => {
            expect(screen.getByText(/no shows|no events/i)).toBeInTheDocument();
        });
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

        // This would require interacting with city filter
        // Implementation depends on actual UI structure
    });
});
