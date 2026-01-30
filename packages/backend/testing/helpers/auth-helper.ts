import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';

/**
 * JWT Secret for testing
 * In production, this comes from environment variables
 */
const TEST_JWT_SECRET = 'test-secret-key-for-testing-only';

export interface TokenPayload {
    id?: string;
    role: Role;
    email?: string;
}

/**
 * Generate a JWT token for testing authenticated requests
 * 
 * @param payload - User data to encode in token
 * @returns JWT token string
 */
export async function createAuthToken(payload: TokenPayload): Promise<string> {
    const userId = payload.id || `test-user-${Date.now()}`;
    const email = payload.email || `${userId}@test.com`;

    const token = jwt.sign(
        {
            id: userId,
            email,
            role: payload.role,
        },
        process.env.JWT_SECRET || TEST_JWT_SECRET,
        {
            expiresIn: '1d',
        }
    );

    return token;
}

/**
 * Create an admin token
 */
export async function createAdminToken(): Promise<string> {
    return createAuthToken({
        id: 'admin-123',
        role: 'ADMIN',
        email: 'admin@test.com',
    });
}

/**
 * Create a verified organizer token
 */
export async function createOrganizerToken(userId?: string): Promise<string> {
    return createAuthToken({
        id: userId || 'organizer-123',
        role: 'ORGANIZER_VERIFIED',
    });
}

/**
 * Create a verified comedian token
 */
export async function createComedianToken(userId?: string): Promise<string> {
    return createAuthToken({
        id: userId || 'comedian-123',
        role: 'COMEDIAN_VERIFIED',
    });
}

/**
 * Create an audience token
 */
export async function createAudienceToken(userId?: string): Promise<string> {
    return createAuthToken({
        id: userId || 'audience-123',
        role: 'AUDIENCE',
    });
}

/**
 * Verify a JWT token (for testing token validation)
 */
export function verifyAuthToken(token: string): any {
    try {
        return jwt.verify(token, process.env.JWT_SECRET || TEST_JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
}
