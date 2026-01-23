/**
 * Test Environment Setup
 * 
 * This file is loaded before each test file runs.
 * It sets up the test environment and global configurations.
 */

// Load environment variables for testing
// Note: NODE_ENV is set by Jest automatically
if (!process.env.NEXTAUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = 'test-secret-for-testing-only';
}
if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
}

// Use test database if available, otherwise warn
if (!process.env.DATABASE_URL_TEST && !process.env.DATABASE_URL) {
    console.warn('⚠️  No DATABASE_URL_TEST or DATABASE_URL set. Database tests may fail.');
}

// Prefer test database
if (process.env.DATABASE_URL_TEST) {
    process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;
}

// Suppress console.log in tests unless DEBUG is set
if (!process.env.DEBUG) {
    global.console = {
        ...console,
        log: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        // Keep warn and error for debugging
        warn: console.warn,
        error: console.error,
    };
}

// Global test lifecycle hooks
beforeAll(async () => {
    // Any global setup can go here
});

afterAll(async () => {
    // Any global teardown can go here
});
