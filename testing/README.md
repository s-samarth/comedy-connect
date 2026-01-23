# Comedy Connect Testing System

> **Version**: 2.0 (Revamped)  
> **Status**: Active  
> **Last Updated**: January 2026

## Overview

This is the **authoritative testing system** for Comedy Connect. It replaces the previous ad-hoc shell script-based testing with a fully automated, decoupled, and CI-ready framework.

## Why This System Exists

The previous testing approach had critical limitations:

| Issue | Previous Approach | New System |
|-------|-------------------|------------|
| **Runtime Coupling** | Required running dev server | Tests run independently |
| **Determinism** | HTTP status checks were loose | Exact assertions |
| **Coverage** | No metrics | Full coverage tracking |
| **Mocking** | None | Proper auth mocking |
| **Database** | Used production DB | Isolated test database |
| **CI Ready** | Manual only | Fully automated |

## Test Categories

### 1. Unit Tests (`/unit/api/`)
Test individual API routes in isolation.

- `shows.test.ts` - `/api/shows` CRUD operations
- `bookings.test.ts` - `/api/bookings` endpoints
- `admin.test.ts` - `/api/admin/*` endpoints
- `organizers.test.ts` - `/api/organizer/*` endpoints
- `comedians.test.ts` - `/api/comedians` endpoints
- `auth.test.ts` - Authentication endpoints

### 2. Integration Tests (`/integration/`)
Test complete user workflows.

- `booking-flow.test.ts` - End-to-end booking process
- `organizer-flow.test.ts` - Organizer verification workflow
- `admin-flow.test.ts` - Admin management capabilities

### 3. Security Tests (`/security/`)
Verify security constraints are enforced.

- `auth.test.ts` - Authentication cannot be bypassed
- `role-access.test.ts` - RBAC is properly enforced
- `admin-security.test.ts` - Admin endpoints are protected

### 4. Schema Tests (`/schema/`)
Validate database schema integrity.

- `prisma-schema.test.ts` - Schema validation
- `migrations.test.ts` - Migration health

## Running Tests

### Full Test Suite (Recommended)
```bash
npm run test:all
```

### Individual Categories
```bash
npm run test:unit       # API unit tests
npm run test:integration # Workflow tests
npm run test:security   # Security tests
npm run test:schema     # Schema tests
```

### With Coverage
```bash
npm run test:all -- --coverage
```

### Watch Mode (Development)
```bash
npm run test:all -- --watch
```

## Test Database Setup

Tests require a separate database to avoid affecting production data.

### Option 1: Environment Variable
Set `DATABASE_URL_TEST` in your `.env`:
```env
DATABASE_URL_TEST="postgresql://user:pass@localhost:5432/comedy_connect_test"
```

### Option 2: Same Database (Isolated Data)
If using the same database, tests use `test-` prefixed IDs and clean up after themselves.

## Writing New Tests

### Test File Structure
```typescript
import { UserRole } from '@prisma/client';
import { createTestUser, cleanupTestData, disconnectTestDb } from '../config/test-db';

// Mock auth module
jest.mock('@/lib/auth', () => ({
  getCurrentUser: jest.fn(),
}));

import * as authModule from '@/lib/auth';

describe('Feature Name', () => {
  beforeAll(async () => {
    // Setup test data
  });

  afterAll(async () => {
    await cleanupTestData();
    await disconnectTestDb();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do something', async () => {
    // Test implementation
  });
});
```

### Testing Authenticated Routes
```typescript
const mockGetCurrentUser = authModule.getCurrentUser as jest.MockedFunction<typeof authModule.getCurrentUser>;

// Simulate authenticated user
mockGetCurrentUser.mockResolvedValue({
  id: 'test-user-id',
  email: 'test@example.com',
  role: UserRole.AUDIENCE,
} as any);

// Simulate unauthenticated
mockGetCurrentUser.mockResolvedValue(null);
```

### Creating Test Data
Use the helpers in `/config/test-db.ts`:
```typescript
const user = await createTestUser(UserRole.AUDIENCE);
const show = await createTestShow(organizerId);
const comedian = await createTestComedian(organizerId);
```

## Contribution Rules

### Mandatory Requirements

1. **All behavior changes require test updates**
   - If you change API behavior, update the corresponding test
   - If you add a feature, add tests for it

2. **Tests must pass before commit**
   ```bash
   npm run test:all  # Must pass
   npm run build     # Must succeed
   ```

3. **New features require tests**
   - Unit tests for new API endpoints
   - Integration tests for new workflows
   - Security tests for new protected routes

4. **No flaky tests**
   - Tests must be deterministic
   - Use proper async/await
   - Clean up test data

### Test Naming Conventions
- Use descriptive test names: `should return 401 for unauthenticated user`
- Group related tests in `describe` blocks
- Follow the pattern: `[action] should [expected behavior] when [condition]`

## Directory Structure

```
testing/
├── README.md                    # This file
├── jest.config.ts               # Jest configuration
├── run-tests.ts                 # Unified test runner
├── config/
│   ├── test-env.ts              # Environment setup
│   ├── test-db.ts               # Database utilities
│   └── auth-mocks.ts            # Auth mocking helpers
├── unit/
│   └── api/                     # API endpoint tests
├── integration/                 # Workflow tests
├── schema/                      # Database schema tests
├── security/                    # Security tests
└── utils/
    ├── test-client.ts           # HTTP test utilities
    ├── seed-test-data.ts        # Data seeding
    └── cleanup.ts               # Cleanup utilities
```

## Expected Output

```
🧪 Comedy Connect Test Suite
══════════════════════════════════════════════════

Running Schema Tests... ✔ PASS (12 tests)
Running API Unit Tests... ✔ PASS (45 tests)
Running Integration Tests... ✔ PASS (15 tests)
Running Security Tests... ✔ PASS (24 tests)

══════════════════════════════════════════════════

📊 Test Summary

✔ Schema Tests        PASS (2.1s)
✔ API Unit Tests      PASS (5.3s)
✔ Integration Tests   PASS (4.2s)
✔ Security Tests      PASS (3.8s)

──────────────────────────────────────────────────
Total: 4 suites | Passed: 4 | Failed: 0
Time: 15.4s

══════════════════════════════════════════════════

✅ OVERALL RESULT: PASS
```

## Troubleshooting

### Test Database Connection Failed
- Ensure `DATABASE_URL` or `DATABASE_URL_TEST` is set
- Verify the database exists and is accessible

### Module Resolution Errors
- Run `npx prisma generate` to regenerate the Prisma client
- Clear Jest cache: `npx jest --clearCache`

### Tests Timing Out
- Increase timeout in `jest.config.ts`: `testTimeout: 60000`
- Check for database connection issues

### Cleanup Errors
- Ensure foreign key constraints are respected
- Check the order of deletions in `cleanupTestData()`

---

**Note**: This testing system is designed for both human developers and AI agents. Follow these conventions consistently.
