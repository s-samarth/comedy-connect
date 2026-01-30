import { onboardingService } from '@/services/onboarding/onboarding.service';
import { userRepository, comedianProfileRepository, organizerProfileRepository } from '@/repositories';
import { ValidationError, BusinessError } from '@/errors';

jest.mock('@/repositories');

describe('OnboardingService - Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('completeAudienceOnboarding', () => {
        const userId = 'user-123';
        const validData = {
            name: 'John Doe',
            city: 'Hyderabad',
            age: 25,
        };

        it('should validate required fields', async () => {
            const invalidData = { name: '' };

            await expect(
                onboardingService.completeAudienceOnboarding(userId, invalidData as any)
            ).rejects.toThrow(ValidationError);
        });

        it('should complete onboarding for audience', async () => {
            const mockUser = {
                id: userId,
                role: 'AUDIENCE',
                onboardingCompleted: false,
            };
            (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
            (userRepository.update as jest.Mock).mockResolvedValue({
                ...mockUser,
                ...validData,
                onboardingCompleted: true,
            });

            const result = await onboardingService.completeAudienceOnboarding(userId, validData);

            expect(result.success).toBe(true);
            expect(userRepository.update).toHaveBeenCalledWith(
                userId,
                expect.objectContaining({
                    onboardingCompleted: true,
                })
            );
        });

        it('should throw BusinessError if already onboarded', async () => {
            const mockUser = {
                id: userId,
                role: 'AUDIENCE',
                onboardingCompleted: true,
            };
            (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

            await expect(
                onboardingService.completeAudienceOnboarding(userId, validData)
            ).rejects.toThrow(BusinessError);
        });
    });

    describe('completeComedianOnboarding', () => {
        const userId = 'user-123';
        const validData = {
            name: 'John Comedian',
            city: 'Mumbai',
            age: 30,
            stageName: 'Johnny Laughs',
            bio: 'Standup comedian',
            experience: 'Performed at 50+ shows',
        };

        it('should validate stage name is provided', async () => {
            const invalidData = { ...validData, stageName: '' };

            await expect(
                onboardingService.completeComedianOnboarding(userId, invalidData as any)
            ).rejects.toThrow(ValidationError);
        });

        it('should create comedian profile and update user', async () => {
            const mockUser = {
                id: userId,
                role: 'AUDIENCE',
                onboardingCompleted: false,
            };
            (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
            (userRepository.update as jest.Mock).mockResolvedValue({
                ...mockUser,
                role: 'COMEDIAN_UNVERIFIED',
                onboardingCompleted: true,
            });
            (comedianProfileRepository.create as jest.Mock).mockResolvedValue({
                userId,
                stageName: validData.stageName,
            });

            const result = await onboardingService.completeComedianOnboarding(userId, validData);

            expect(result.success).toBe(true);
            expect(comedianProfileRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId,
                    stageName: validData.stageName,
                })
            );
        });
    });

    describe('completeOrganizerOnboarding', () => {
        const userId = 'user-123';
        const validData = {
            name: 'Jane Organizer',
            city: 'Delhi',
            age: 35,
            organizationName: 'Comedy Events Co',
            website: 'https://comedyevents.com',
            pastEvents: 'Organized 20+ shows',
        };

        it('should validate organization name', async () => {
            const invalidData = { ...validData, organizationName: '' };

            await expect(
                onboardingService.completeOrganizerOnboarding(userId, invalidData as any)
            ).rejects.toThrow(ValidationError);
        });

        it('should create organizer profile and update user', async () => {
            const mockUser = {
                id: userId,
                role: 'AUDIENCE',
                onboardingCompleted: false,
            };
            (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);
            (userRepository.update as jest.Mock).mockResolvedValue({
                ...mockUser,
                role: 'ORGANIZER_UNVERIFIED',
                onboardingCompleted: true,
            });
            (organizerProfileRepository.create as jest.Mock).mockResolvedValue({
                userId,
                organizationName: validData.organizationName,
            });

            const result = await onboardingService.completeOrganizerOnboarding(userId, validData);

            expect(result.success).toBe(true);
            expect(organizerProfileRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId,
                    organizationName: validData.organizationName,
                })
            );
        });
    });
});
