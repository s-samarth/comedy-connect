// Domain Error Classes
// These errors represent business/domain-level failures and are thrown by services

/**
 * Base domain error class
 */
export class DomainError extends Error {
    constructor(message: string, public code: string) {
        super(message)
        this.name = this.constructor.name
    }
}

/**
 * Thrown when user is not authenticated or session is invalid
 */
export class UnauthorizedError extends DomainError {
    constructor(message = "Unauthorized") {
        super(message, "UNAUTHORIZED")
    }
}

/**
 * Thrown when a requested resource is not found
 */
export class NotFoundError extends DomainError {
    constructor(resource: string) {
        super(`${resource} not found`, "NOT_FOUND")
    }
}

/**
 * Thrown when input validation fails
 */
export class ValidationError extends DomainError {
    constructor(message: string) {
        super(message, "VALIDATION_ERROR")
    }
}

/**
 * Thrown when booking-specific business rules are violated
 */
export class BookingError extends DomainError {
    constructor(message: string) {
        super(message, "BOOKING_ERROR")
    }
}

/**
 * Thrown when user lacks required permissions
 */
export class ForbiddenError extends DomainError {
    constructor(message = "Access denied") {
        super(message, "FORBIDDEN")
    }
}

/**
 * Maps domain errors to HTTP response objects
 * Used by API route handlers to convert service errors to HTTP responses
 */
export function mapErrorToResponse(error: unknown): { status: number; error: string } {
    if (error instanceof UnauthorizedError) {
        return { status: 401, error: error.message }
    }

    if (error instanceof ForbiddenError) {
        return { status: 403, error: error.message }
    }

    if (error instanceof NotFoundError) {
        return { status: 404, error: error.message }
    }

    if (error instanceof ValidationError) {
        return { status: 400, error: error.message }
    }

    if (error instanceof BookingError) {
        return { status: 400, error: error.message }
    }

    // Handle standard Error objects
    if (error instanceof Error) {
        console.error("Unexpected error:", error)
        return { status: 500, error: error.message }
    }

    // Unknown errors
    console.error("Unknown error type:", error)
    return { status: 500, error: "Internal server error" }
}
