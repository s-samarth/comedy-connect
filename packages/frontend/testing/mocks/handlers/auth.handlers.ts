import { http, HttpResponse } from 'msw';

/**
 * MSW Handlers for Authentication API
 */

export const authHandlers = [
    // GET /api/v1/auth/session - Get current session
    http.get('*/api/v1/auth/session', () => {
        return HttpResponse.json({
            user: {
                id: 'test-user-123',
                email: 'test@example.com',
                name: 'Test User',
                role: 'AUDIENCE',
                onboardingCompleted: true,
            },
        });
    }),

    // POST /api/v1/auth/signout - Sign out
    http.post('*/api/v1/auth/signout', () => {
        return HttpResponse.json({ success: true });
    }),

    // GET /api/v1/auth/callback - OAuth callback (mock)
    http.get('*/api/v1/auth/callback', () => {
        return HttpResponse.json({ success: true });
    }),
];
