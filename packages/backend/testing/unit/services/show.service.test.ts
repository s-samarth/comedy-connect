import { showService } from '@/services/shows/show.service';
import { showRepository } from '@/repositories';
import { ValidationError, NotFoundError, UnauthorizedError } from '@/errors';

// Mock all repositories
jest.mock('@/repositories');

describe('ShowService - Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createShow', () => {
        const userId = 'test-user-id';
        const validShowData = {
            title: 'Test Comedy Night',
            venue: 'Test Venue',
            city: 'Hyderabad',
            date: new Date('2026-06-01'),
            time: '19:00',
            duration: 90,
            category: 'Standup',
            ticketPrice: 500,
            totalSeats: 100,
            description: 'A hilarious night of comedy',
        };

        it('should validate required fields', async () => {
            const invalidData = { title: '' };

            await expect(
                showService.createShow(userId, invalidData as any)
            ).rejects.toThrow(ValidationError);
        });

        it('should validate ticket price is positive', async () => {
            const invalidData = { ...validShowData, ticketPrice: -100 };

            await expect(
                showService.createShow(userId, invalidData)
            ).rejects.toThrow(ValidationError);
        });

        it('should validate total seats is positive', async () => {
            const invalidData = { ...validShowData, totalSeats: 0 };

            await expect(
                showService.createShow(userId, invalidData)
            ).rejects.toThrow(ValidationError);
        });

        it('should validate duration is reasonable', async () => {
            const invalidData = { ...validShowData, duration: 500 };

            await expect(
                showService.createShow(userId, invalidData)
            ).rejects.toThrow(ValidationError);
        });

        it('should create show with valid data', async () => {
            const mockShow = { id: 'show-123', ...validShowData, creatorId: userId };
            (showRepository.create as jest.Mock).mockResolvedValue(mockShow);

            const result = await showService.createShow(userId, validShowData);

            expect(result).toBeDefined();
            expect(showRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    creatorId: userId,
                    title: validShowData.title,
                })
            );
        });
    });

    describe('getShowById', () => {
        it('should throw NotFoundError if show does not exist', async () => {
            const showId = 'non-existent-id';
            (showRepository.findById as jest.Mock).mockResolvedValue(null);

            await expect(
                showService.getShowById(showId)
            ).rejects.toThrow(NotFoundError);
        });

        it('should return show if it exists', async () => {
            const mockShow = {
                id: 'show-123',
                title: 'Comedy Night',
                isPublished: true,
            };
            (showRepository.findById as jest.Mock).mockResolvedValue(mockShow);

            const result = await showService.getShowById('show-123');

            expect(result).toEqual(expect.objectContaining(mockShow));
            expect(showRepository.findById).toHaveBeenCalledWith('show-123');
        });
    });

    describe('publishShow', () => {
        const showId = 'show-123';
        const userId = 'user-123';

        it('should throw NotFoundError if show does not exist', async () => {
            (showRepository.findById as jest.Mock).mockResolvedValue(null);

            await expect(
                showService.publishShow(showId, userId)
            ).rejects.toThrow(NotFoundError);
        });

        it('should throw UnauthorizedError if user is not the owner', async () => {
            const mockShow = {
                id: showId,
                creatorId: 'different-user',
                isPublished: false,
            };
            (showRepository.findById as jest.Mock).mockResolvedValue(mockShow);

            await expect(
                showService.publishShow(showId, userId)
            ).rejects.toThrow(UnauthorizedError);
        });

        it('should publish show if user is owner', async () => {
            const mockShow = {
                id: showId,
                creatorId: userId,
                isPublished: false,
            };
            (showRepository.findById as jest.Mock).mockResolvedValue(mockShow);
            (showRepository.update as jest.Mock).mockResolvedValue({
                ...mockShow,
                isPublished: true,
            });

            const result = await showService.publishShow(showId, userId);

            expect(result.success).toBe(true);
            expect(showRepository.update).toHaveBeenCalledWith(
                showId,
                expect.objectContaining({ isPublished: true })
            );
        });
    });
});
