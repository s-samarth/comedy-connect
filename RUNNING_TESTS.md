# 🧪 Running Tests - Quick Start Guide

## Prerequisites

Before running tests, you need to set up test environment variables.

### 1. Create Test Environment File

```bash
cd packages/backend
cp .env.test.example .env.test
```

### 2. Configure Test Database

**IMPORTANT**: Use a **separate test database** - never use your development database for tests!

Edit `.env.test` and set your test database URL:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/comedy-connect-test"
```

**Create the test database:**

```bash
# PostgreSQL
createdb comedy-connect-test

# Or via psql
psql -U postgres -c "CREATE DATABASE \"comedy-connect-test\";"
```

### 3. Run Prisma Migrations on Test Database

```bash
cd packages/backend
DATABASE_URL="postgresql://user:password@localhost:5432/comedy-connect-test" npx prisma migrate deploy
```

---

## Running Tests

### From Repository Root

```bash
# Run all tests (backend + frontend)
npm run test:all

# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Run E2E tests
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### From Backend Package

```bash
cd packages/backend

# Run all backend tests
npm run test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:security
npm run test:contract

# Run with coverage
npm run test:coverage
```

### From Frontend Package

```bash
cd packages/frontend

# Run all frontend tests
npm run test

# Watch mode
npm run test:watch

# UI mode
npm run test:ui

# Coverage
npm run test:coverage
```

---

## Troubleshooting

### "DATABASE_URL is missing"

**Solution**: Create `.env.test` file in `packages/backend/` with test database URL.

### "Jest: Got error running globalTeardown"

**Solution**: Ensure your test database exists and is accessible.

### Tests are slow

**Solution**: Tests run sequentially for database safety. This is expected. Unit tests should still be fast (<100ms each).

### MSW not intercepting requests (Frontend)

**Solution**: Ensure MSW server is set up in `testing/setup.ts`.

---

## Test Database Best Practices

1. **Never use production database** for tests
2. **Use a separate test database** from development
3. **Tests will modify data** - the database is reset between tests
4. **Keep test database schema in sync** with development using Prisma migrations

---

## Additional Documentation

- [Main Testing Guide](../../docs/TESTING.md)
- [Backend Testing README](packages/backend/testing/README.md)
- [Frontend Testing README](packages/frontend/testing/README.md)
- [E2E Testing README](testing/e2e/README.md)
