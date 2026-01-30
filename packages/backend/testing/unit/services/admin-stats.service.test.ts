import { adminStatsService } from '@/services/admin/admin-stats.service';
import { userRepository, showRepository, bookingRepository } from '@/repositories';

jest.mock('@/repositories');

describe('AdminStatsService - Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getDashboardStats', () => {
        it('should aggregate statistics from multiple sources', async () => {
            (userRepository.count as jest.Mock).mockResolvedValue(1000);
            (showRepository.count as jest.Mock).mockResolvedValue(50);
            (bookingRepository.count as jest.Mock).mockResolvedValue(500);
            (bookingRepository.sumRevenue as jest.Mock).mockResolvedValue(250000);

            const stats = await adminStatsService.getDashboardStats();

            expect(stats).toEqual(expect.objectContaining({
                totalUsers: 1000,
                totalShows: 50,
                totalBookings: 500,
                totalRevenue: 250000,
            }));
        });

        it('should calculate platform fees correctly', async () => {
            (bookingRepository.sumPlatformFees as jest.Mock).mockResolvedValue(25000);

            const stats = await adminStatsService.getDashboardStats();

            expect(stats.platformFees).toBe(25000);
        });

        it('should return role distribution', async () => {
            const mockRoleDistribution = [
                { role: 'AUDIENCE', count: 800 },
                { role: 'COMEDIAN_VERIFIED', count: 50 },
                { role: 'ORGANIZER_VERIFIED', count: 30 },
            ];
            (userRepository.getRoleDistribution as jest.Mock).mockResolvedValue(mockRoleDistribution);

            const stats = await adminStatsService.getDashboardStats();

            expect(stats.roleDistribution).toEqual(mockRoleDistribution);
        });
    });

    describe('getPendingApprovals', () => {
        it('should return pending comedian approvals', async () => {
            const mockPendingComedians = [
                { userId: 'user-1', role: 'COMEDIAN_UNVERIFIED' },
                { userId: 'user-2', role: 'COMEDIAN_UNVERIFIED' },
            ];
            (userRepository.findByRole as jest.Mock).mockResolvedValue(mockPendingComedians);

            const approvals = await adminStatsService.getPendingApprovals();

            expect(approvals.pendingComedians).toHaveLength(2);
        });

        it('should return pending organizer approvals', async () => {
            const mockPendingOrganizers = [
                { userId: 'user-3', role: 'ORGANIZER_UNVERIFIED' },
            ];
            (userRepository.findByRole as jest.Mock).mockResolvedValue(mockPendingOrganizers);

            const approvals = await adminStatsService.getPendingApprovals();

            expect(approvals.pendingOrganizers).toHaveLength(1);
        });
    });

    describe('getRevenueAnalytics', () => {
        it('should aggregate revenue by time period', async () => {
            const mockRevenueData = [
                { date: '2026-01', revenue: 50000 },
                { date: '2026-02', revenue: 75000 },
            ];
            (bookingRepository.getRevenueByPeriod as jest.Mock).mockResolvedValue(mockRevenueData);

            const analytics = await adminStatsService.getRevenueAnalytics('monthly');

            expect(analytics).toHaveLength(2);
            expect(analytics[0].revenue).toBe(50000);
        });

        it('should calculate growth percentage', async () => {
            const mockRevenueData = [
                { date: '2026-01', revenue: 50000 },
                { date: '2026-02', revenue: 75000 },
            ];
            (bookingRepository.getRevenueByPeriod as jest.Mock).mockResolvedValue(mockRevenueData);

            const analytics = await adminStatsService.getRevenueAnalytics('monthly');

            // Growth from 50k to 75k is 50%
            expect(analytics[1].growth).toBe(50);
        });
    });
});
