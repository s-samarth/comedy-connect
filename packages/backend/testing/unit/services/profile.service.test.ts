import { profileService } from '@/services/profile/profile.service';
import { userRepository } from '@/repositories';
import { ValidationError, NotFoundError } from '@/errors';

jest.mock('@/repositories');

describe('ProfileService - Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('updateProfile', () => {
        const userId = 'user-123';
        const validProfileData = {
            name: 'John Doe',
            city: 'Hyderabad',
            age: 25,
            phone: '+919876543210',
            bio: 'Comedy enthusiast',
        };

        it('should validate name is not empty', async () => {
            const invalidData = { name: '' };

            await expect(
                profileService.updateProfile(userId, invalidData)
            ).rejects.toThrow(ValidationError);
        });

        it('should validate age is within range', async () => {
            const invalidData = { ...validProfileData, age: 150 };

            await expect(
                profileService.updateProfile(userId, invalidData)
            ).rejects.toThrow(ValidationError);
        });

        it('should validate phone format', async () => {
            const invalidData = { ...validProfileData, phone: 'invalid' };

            await expect(
                profileService.updateProfile(userId, invalidData)
            ).rejects.toThrow(ValidationError);
        });

        it('should update profile with valid data', async () => {
            const mockUser = { id: userId, ...validProfileData };
            (userRepository.update as jest.Mock).mockResolvedValue(mockUser);

            const result = await profileService.updateProfile(userId, validProfileData);

            expect(result).toBeDefined();
            expect(userRepository.update).toHaveBeenCalledWith(
                userId,
                expect.objectContaining(validProfileData)
            );
        });

        it('should throw NotFoundError if user does not exist', async () => {
            (userRepository.update as jest.Mock).mockResolvedValue(null);

            await expect(
                profileService.updateProfile(userId, validProfileData)
            ).rejects.toThrow(NotFoundError);
        });
    });

    describe('getProfile', () => {
        it('should return user profile', async () => {
            const mockUser = {
                id: 'user-123',
                email: 'test@example.com',
                name: 'John Doe',
                role: 'AUDIENCE',
            };
            (userRepository.findById as jest.Mock).mockResolvedValue(mockUser);

            const result = await profileService.getProfile('user-123');

            expect(result).toEqual(expect.objectContaining(mockUser));
        });

        it('should throw NotFoundError if user not found', async () => {
            (userRepository.findById as jest.Mock).mockResolvedValue(null);

            await expect(
                profileService.getProfile('non-existent')
            ).rejects.toThrow(NotFoundError);
        });
    });
});
