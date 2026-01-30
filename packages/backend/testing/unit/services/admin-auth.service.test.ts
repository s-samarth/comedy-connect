import { adminAuthService } from '@/services/admin/admin-auth.service';
import { adminRepository } from '@/repositories';
import { UnauthorizedError, ValidationError } from '@/errors';

jest.mock('@/repositories');
jest.mock('bcryptjs');

describe('AdminAuthService - Unit Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        const validCredentials = {
            email: 'admin@test.com',
            password: 'securePassword123',
        };

        it('should validate email format', async () => {
            const invalidData = { email: 'invalid-email', password: 'password' };

            await expect(
                adminAuthService.login(invalidData)
            ).rejects.toThrow(ValidationError);
        });

        it('should validate password is provided', async () => {
            const invalidData = { email: 'admin@test.com', password: '' };

            await expect(
                adminAuthService.login(invalidData)
            ).rejects.toThrow(ValidationError);
        });

        it('should throw UnauthorizedError if admin not found', async () => {
            (adminRepository.findByEmail as jest.Mock).mockResolvedValue(null);

            await expect(
                adminAuthService.login(validCredentials)
            ).rejects.toThrow(UnauthorizedError);
        });

        it('should throw UnauthorizedError if password is incorrect', async () => {
            const mockAdmin = {
                id: 'admin-123',
                email: validCredentials.email,
                passwordHash: 'hashed-password',
            };
            (adminRepository.findByEmail as jest.Mock).mockResolvedValue(mockAdmin);

            const bcrypt = require('bcryptjs');
            bcrypt.compare = jest.fn().mockResolvedValue(false);

            await expect(
                adminAuthService.login(validCredentials)
            ).rejects.toThrow(UnauthorizedError);
        });

        it('should return token if credentials are valid', async () => {
            const mockAdmin = {
                id: 'admin-123',
                email: validCredentials.email,
                passwordHash: 'hashed-password',
            };
            (adminRepository.findByEmail as jest.Mock).mockResolvedValue(mockAdmin);

            const bcrypt = require('bcryptjs');
            bcrypt.compare = jest.fn().mockResolvedValue(true);

            const result = await adminAuthService.login(validCredentials);

            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('admin');
        });
    });

    describe('validateToken', () => {
        it('should throw UnauthorizedError for invalid token', async () => {
            const invalidToken = 'invalid.token.here';

            await expect(
                adminAuthService.validateToken(invalidToken)
            ).rejects.toThrow(UnauthorizedError);
        });

        it('should return admin for valid token', async () => {
            // This would require mocking JWT verification
            // Implementation depends on your auth strategy
        });
    });
});
