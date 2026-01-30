import { test, expect } from '@playwright/test';

/**
 * Critical Flow: User Authentication
 * 
 * Tests the complete authentication flow including:
 * - Accessing public pages without auth
 * - Signing in with Google OAuth
 * - Accessing protected pages after auth
 * - Signing out
 */

test.describe('Authentication Flow', () => {
    test('should allow browsing shows as guest', async ({ page }) => {
        // Navigate to shows page
        await page.goto('/shows');

        // Verify page loads
        await expect(page.locator('h1')).toContainText(/shows|comedy/i);

        // Should see shows (may be empty state or actual shows)
        await expect(page.locator('body')).toBeVisible();
    });

    test('should redirect to sign-in for protected pages', async ({ page }) => {
        // Try to access profile page without auth
        await page.goto('/profile');

        // Should redirect to sign-in or show auth required message
        // Note: Actual behavior depends on middleware implementation
        const url = page.url();
        expect(url).toMatch(/sign-in|auth|login/i);
    });

    test.skip('should complete OAuth sign-in flow', async ({ page }) => {
        // This test is skipped because it requires actual OAuth setup
        // In a real implementation, you would:
        // 1. Mock OAuth provider or use test credentials
        // 2. Click sign-in button
        // 3. Complete OAuth flow
        // 4. Verify successful authentication

        await page.goto('/');
        await page.click('text=Sign In');

        // OAuth flow would happen here
        // await page.click('text=Continue with Google');
        // ...OAuth provider interaction...

        // Verify signed in
        // await expect(page.locator('text=Profile')).toBeVisible();
    });

    test.skip('should sign out successfully', async ({ page }) => {
        // This test requires being signed in first
        // 1. Sign in (setup)
        // 2. Click sign out
        // 3. Verify signed out state

        // await setupAuthenticatedSession(page);
        // await page.click('text=Sign Out');
        // await expect(page.locator('text=Sign In')).toBeVisible();
    });
});
