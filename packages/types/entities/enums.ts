/**
 * User Role Enumeration
 * Matches the Prisma UserRole enum
 */
export enum UserRole {
    AUDIENCE = 'AUDIENCE',
    ORGANIZER_UNVERIFIED = 'ORGANIZER_UNVERIFIED',
    ORGANIZER_VERIFIED = 'ORGANIZER_VERIFIED',
    ADMIN = 'ADMIN',
    COMEDIAN_UNVERIFIED = 'COMEDIAN_UNVERIFIED',
    COMEDIAN_VERIFIED = 'COMEDIAN_VERIFIED',
}

/**
 * Approval Status Enumeration
 */
export enum ApprovalStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

/**
 * Booking Status Enumeration
 */
export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CONFIRMED_UNPAID = 'CONFIRMED_UNPAID',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED',
}
