/**
 * Custom error classes and utilities for the Comedy Connect frontend
 */

/**
 * Custom API error class with structured error information
 */
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    /**
     * Check if error is an authentication error (401 Unauthorized)
     */
    isUnauthorized(): boolean {
        return this.status === 401;
    }

    /**
     * Check if error is a not found error (404)
     */
    isNotFound(): boolean {
        return this.status === 404;
    }

    /**
     * Check if error is a server error (5xx)
     */
    isServerError(): boolean {
        return this.status >= 500;
    }

    /**
     * Check if error is a client error (4xx)
     */
    isClientError(): boolean {
        return this.status >= 400 && this.status < 500;
    }

    /**
     * Get user-friendly error message
     */
    getUserMessage(): string {
        if (this.isUnauthorized()) {
            return 'You need to be logged in to perform this action.';
        }
        if (this.isNotFound()) {
            return 'The requested resource was not found.';
        }
        if (this.isServerError()) {
            return 'A server error occurred. Please try again later.';
        }
        return this.message || 'An error occurred. Please try again.';
    }
}

/**
 * Normalize any error into a user-friendly string message
 * @param error - Unknown error object
 * @returns Normalized error message or null if no error
 */
export function normalizeError(error: unknown): string | null {
    if (!error) return null;

    if (error instanceof ApiError) {
        return error.getUserMessage();
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'An unexpected error occurred';
}

/**
 * Check if an error is an ApiError instance
 */
export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError;
}
