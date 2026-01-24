# Testing Documentation

The Comedy Connect project uses a comprehensive **Jest-based testing framework** to ensure application stability and security.

## 🧪 Quick Start

1. **Setup Test Environment**
   Create a `.env.test.local` file in the root directory to provide a database connection for integration tests:
   ```env
   # Use your local development database or a dedicated test DB
   DATABASE_URL="postgresql://username:password@localhost:5432/comedy_connect"
   ```

2. **Run All Tests**
   ```bash
   npm run test:all
   ```

## 📂 Test Structure

The test suite is organized into four main categories in the `testing/` directory:

| Directory | Type | Description |
|-----------|------|-------------|
| `unit/` | **Unit Tests** | Tests individual API endpoints and functions using mocked dependencies. Fast and isolated. |
| `integration/` | **Integration Tests** | Tests complete user flows (e.g., "Guest books a ticket") using a **real database**. |
| `security/` | **Security Tests** | Verifies RBAC (Role-Based Access Control) and authentication barriers. |
| `schema/` | **Schema Tests** | Validates Prisma schema integrity, constraints, and relationships. |

## 🛠️ Configuration

### Environment Variables
- **Unit Tests**: Use mocked environment variables.
- **Integration Tests**: Load variables from `.env.test.local` via `@next/env`.
  - **Required**: `DATABASE_URL` (for DB access)

### Database Handling
- **Integration Tests** use `testing/config/test-db.ts` helpers.
- `createTestUser`, `createTestShow`, etc., create real records.
- **Teardown**: `cleanupTestData()` creates a clean state after suites run.

### Test Data Cleanup
For thorough manual cleanup of test-generated records (users, shows, bookings):
```bash
npx ts-node scripts/cleanup-test-artifacts.ts
```
This script identifies test artifacts by specific patterns (e.g., emails containing "test") and removes them from the database.

## 🧩 Mocking Strategy

We use **Jest Mocks** to isolate unit tests from external services:

- **Authentication**: `lib/auth.ts` is mocked to simulate different user roles (`AUDIENCE`, `ADMIN`, `ORGANIZER_VERIFIED`).
  - *Example*: `mockRequireShowCreator.mockResolvedValue({ role: 'ORGANIZER_VERIFIED' })`
- **Admin Session**: `lib/admin-password.ts` is mocked for admin flow tests.
- **Prisma**: Deep mocked for unit tests; Real client used for integration tests.

## 📝 Writing Tests

### Unit Test Example
```typescript
it('should create show successfully', async () => {
  // 1. Mock Auth
  mockRequireShowCreator.mockResolvedValue({ id: 'user-1', role: 'ORGANIZER_VERIFIED' });
  
  // 2. Mock DB Call
  prismaMock.show.create.mockResolvedValue(mockShow);

  // 3. Call API
  const response = await POST(req);
  
  // 4. Assert
  expect(response.status).toBe(201);
});
```

### Integration Test Example
```typescript
it('should allow user to book tickets', async () => {
  // 1. Create real data
  const user = await createTestUser(UserRole.AUDIENCE);
  const show = await createTestShow(organizer.id);

  // 2. Perform Action (simulated request)
  const response = await POST(request);

  // 3. Verify in DB
  const booking = await prisma.booking.findFirst({ where: { userId: user.id }});
  expect(booking).toBeDefined();
});
```
