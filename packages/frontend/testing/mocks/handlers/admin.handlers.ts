import { http, HttpResponse } from 'msw';

/**
 * MSW Handlers for Admin API
 */

export const adminHandlers = [
    // GET /api/v1/admin/stats - Get dashboard statistics
    http.get('*/api/v1/admin/stats', () => {
        return HttpResponse.json({
            totalUsers: 1000,
            totalShows: 50,
            totalBookings: 500,
            totalRevenue: 250000,
            platformFees: 25000,
            pendingApprovals: 5,
            roleDistribution: [
                { role: 'AUDIENCE', count: 800 },
                { role: 'COMEDIAN_VERIFIED', count: 50 },
                { role: 'ORGANIZER_VERIFIED', count: 30 },
                { role: 'COMEDIAN_UNVERIFIED', count: 3 },
                { role: 'ORGANIZER_UNVERIFIED', count: 2 },
            ],
        });
    }),

    // GET /api/v1/admin/comedians - Get comedian approvals
    http.get('*/api/v1/admin/comedians', () => {
        return HttpResponse.json({
            comedians: [
                {
                    id: 'comedian-1',
                    name: 'Pending Comedian',
                    email: 'comedian@test.com',
                    status: 'COMEDIAN_UNVERIFIED',
                },
            ],
        });
    }),

    // POST /api/v1/admin/comedians/:id/approve - Approve comedian
    http.post('*/api/v1/admin/comedians/:id/approve', () => {
        return HttpResponse.json({ success: true });
    }),

    // POST /api/v1/admin/comedians/:id/reject - Reject comedian
    http.post('*/api/v1/admin/comedians/:id/reject', () => {
        return HttpResponse.json({ success: true });
    }),

    // GET /api/v1/admin/collections - Get financial collections
    http.get('*/api/v1/admin/collections', () => {
        return HttpResponse.json({
            collections: [
                {
                    showId: 'show-1',
                    showTitle: 'Comedy Night',
                    grossRevenue: 50000,
                    platformFees: 5000,
                    creatorPayout: 45000,
                    isDisbursed: false,
                },
            ],
        });
    }),

    // POST /api/v1/admin/collections/:id/disburse - Mark as disbursed
    http.post('*/api/v1/admin/collections/:id/disburse', () => {
        return HttpResponse.json({ success: true });
    }),
];
