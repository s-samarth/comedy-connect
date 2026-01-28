import { http, HttpResponse } from 'msw';

export const handlers = [
    // Example Health Check Mock
    http.get('*/api/health', () => {
        return HttpResponse.json({ status: 'ok' });
    }),
];
