import { http, HttpResponse } from 'msw';
import { mockShows } from '../data/shows.mock';

/**
 * MSW Handlers for Shows API
 */

export const showsHandlers = [
    // GET /api/v1/shows - List all shows
    http.get('*/api/v1/shows', ({ request }) => {
        const url = new URL(request.url);
        const city = url.searchParams.get('city');

        let shows = mockShows();

        if (city) {
            shows = shows.filter(show => show.city === city);
        }

        return HttpResponse.json({ shows });
    }),

    // GET /api/v1/shows/:id - Get single show
    http.get('*/api/v1/shows/:id', ({ params }) => {
        const { id } = params;
        const shows = mockShows();
        const show = shows.find(s => s.id === id);

        if (!show) {
            return HttpResponse.json(
                { error: 'Show not found' },
                { status: 404 }
            );
        }

        return HttpResponse.json({ show });
    }),

    // POST /api/v1/shows - Create show
    http.post('*/api/v1/shows', async ({ request }) => {
        const body = await request.json() as any;

        const newShow = {
            id: `show-${Date.now()}`,
            ...body,
            isPublished: false,
            createdAt: new Date().toISOString(),
        };

        return HttpResponse.json({ show: newShow }, { status: 201 });
    }),

    // PATCH /api/v1/shows/:id - Update show
    http.patch('*/api/v1/shows/:id', async ({ params, request }) => {
        const { id } = params;
        const updates = await request.json() as any;

        const shows = mockShows();
        const show = shows.find(s => s.id === id);

        if (!show) {
            return HttpResponse.json(
                { error: 'Show not found' },
                { status: 404 }
            );
        }

        const updatedShow = { ...show, ...updates };
        return HttpResponse.json({ show: updatedShow });
    }),

    // DELETE /api/v1/shows/:id - Delete show
    http.delete('*/api/v1/shows/:id', ({ params }) => {
        const { id } = params;

        return HttpResponse.json({ success: true });
    }),
];
