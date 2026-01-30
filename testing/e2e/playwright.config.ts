import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Testing Configuration for Comedy Connect
 * 
 * This configuration runs E2E tests against local development servers.
 * Ensure both backend (port 4000) and frontend (port 3000) are running.
 */
export default defineConfig({
    testDir: './critical-flows',

    // Maximum time one test can run
    timeout: 30 * 1000,

    // Run tests in files in parallel
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Limit workers on CI
    workers: process.env.CI ? 1 : undefined,

    // Reporter to use
    reporter: [
        ['html', { outputFolder: '../coverage/playwright-report' }],
        ['list'],
    ],

    // Shared settings for all projects
    use: {
        // Base URL for navigation
        baseURL: 'http://localhost:3000',

        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // Screenshot on failure
        screenshot: 'only-on-failure',

        // Video on failure
        video: 'retain-on-failure',
    },

    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },

        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },

        // Mobile viewports
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],

    // Run local dev servers before starting tests
    webServer: [
        {
            command: 'npm run dev:backend',
            url: 'http://localhost:4000',
            timeout: 120 * 1000,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'cd packages/frontend && npm run dev',
            url: 'http://localhost:3000',
            timeout: 120 * 1000,
            reuseExistingServer: !process.env.CI,
        },
    ],
});
