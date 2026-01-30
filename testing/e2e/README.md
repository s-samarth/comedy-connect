# E2E Testing with Playwright

This directory contains end-to-end tests for Comedy Connect using Playwright.

## 📋 Overview

E2E tests simulate real user interactions across the entire application stack (frontend + backend). They test critical user journeys to ensure the application works correctly from a user's perspective.

## 🏗️ Structure

```
e2e/
├── critical-flows/           # Test specifications
│   ├── auth.spec.ts         # Authentication flow
│   ├── booking.spec.ts      # Ticket booking flow
│   ├── show-management.spec.ts # Show CRUD operations
│   └── admin.spec.ts        # Admin workflows
├── fixtures/                # Page objects and test data
├── playwright.config.ts     # Playwright configuration
└── README.md               # This file
```

## 🚀 Running Tests

### Prerequisites

1. Install Playwright browsers (first time only):
```bash
npx playwright install
```

2. Ensure backend and frontend are running:
```bash
# Terminal 1
npm run dev:backend

# Terminal 2
cd packages/frontend && npm run dev
```

### Run Tests

```bash
# Run all E2E tests
npx playwright test

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test auth.spec.ts

# Run in debug mode
npx playwright test --debug

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### View Results

```bash
# View HTML report
npx playwright show-report

# Report location: ../coverage/playwright-report/
```

## ✅ Test Coverage

### Critical User Flows

1. **Authentication Flow** (`auth.spec.ts`)
   - Browse as guest
   - Sign in with OAuth
   - Access protected pages
   - Sign out

2. **Booking Flow** (`booking.spec.ts`)
   - Browse shows
   - View show details
   - Select tickets
   - Complete booking
   - View confirmation

3. **Show Management** (`show-management.spec.ts`)
   - Create show (organizer)
   - Edit show details
   - Publish show
   - View in discovery

4. **Admin Workflows** (`admin.spec.ts`)
   - Admin authentication
   - View statistics
   - Approve/reject applications
   - View collections

## 📝 Writing Tests

### Best Practices

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/starting-page');
  });

  test('should perform expected behavior', async ({ page }) => {
    // Arrange: Set up test conditions
    await page.fill('[name="email"]', 'test@example.com');
    
    // Act: Perform user action
    await page.click('button:has-text("Submit")');
    
    // Assert: Verify expected outcome
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Locator Strategies

**Priority Order**:
1. Test IDs: `[data-testid="show-card"]`
2. Role: `button:has-text("Book Now")`
3. Text: `text=Comedy Night`
4. CSS Selectors: `.show-card` (last resort)

### Handling Authentication

For tests requiring authentication:

```typescript
// Option 1: Use setup project (recommended for many tests)
// Configure in playwright.config.ts

// Option 2: Manual authentication in test
test('authenticated flow', async ({ page }) => {
  // Set authentication state
  await page.context().addCookies([/* auth cookies */]);
  
  // Or perform sign-in flow
  await page.goto('/auth/signin');
  // ... complete sign-in
});
```

## 🐛 Debugging

### Interactive Debugging

```bash
# Run with headed browser and pause
npx playwright test --headed --debug

# Generate trace for specific test
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Screenshots & Videos

- Screenshots: Captured on failure automatically
- Videos: Recorded on failure (configured in playwright.config.ts)
- Location: `test-results/` directory

### Common Issues

**Test Fails Locally**:
- Ensure backend is running on port 4000
- Ensure frontend is running on port 3000
- Clear browser cache: `npx playwright test --project=chromium --headed`

**Timeouts**:
- Increase timeout in test: `test.setTimeout(60000)`
- Or globally in `playwright.config.ts`

**Flaky Tests**:
- Use `page.waitForLoadState()` before assertions
- Wait for specific elements: `await expect(element).toBeVisible()`
- Avoid hardcoded timeouts: `await page.waitForTimeout(1000)` ❌

## 📊 Coverage

E2E tests focus on:
- Happy paths for critical flows
- Common error scenarios
- Cross-browser compatibility
- Mobile responsiveness

**Not tested in E2E**:
- Edge cases (covered in unit/integration tests)
- All possible input combinations
- Implementation details

## 🔗 Related Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Main Testing Guide](../../docs/TESTING.md)
- [Backend Testing](../../packages/backend/testing/README.md)
- [Frontend Testing](../../packages/frontend/testing/README.md)
