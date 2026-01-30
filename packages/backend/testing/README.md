# Backend Testing Guide

This directory contains all backend tests for Comedy Connect.

## 📋 Overview

The backend testing infrastructure uses Jest and follows a multi-layered approach:
- **Unit Tests**: Test services and repositories in isolation
- **Integration Tests**: Test API endpoints with real database
- **Security Tests**: Verify RBAC and authentication
- **Contract Tests**: Validate API responses match type definitions

## 🏗️ Structure

```
packages/backend/testing/
├── unit/                    # Unit tests (mocked dependencies)
│   ├── services/           # Service layer tests
│   └── repositories/       # Repository layer tests
├── integration/            # Integration tests (real DB)
│   ├── api/               # API endpoint tests
│   └── workflows/         # Multi-step workflow tests
├── security/              # Security & RBAC tests
├── contract/              # API contract validation
├── fixtures/              # Reusable test data
├── helpers/               # Test utilities
├── utils/                 # Infrastructure utilities
├── setup.ts              # Global test setup
├── teardown.ts           # Global test teardown
├── jest.config.ts        # Jest configuration
└── README.md             # This file
```

## 🚀 Running Tests

```bash
# Run all backend tests
npm run test:backend

# Run specific test suites
npm run test:unit           # Service & repository unit tests
npm run test:integration    # API endpoint integration tests
npm run test:security       # RBAC and auth tests
npm run test:contract       # API contract validation

# Run specific test file
npm run test:unit -- show.service.test.ts

# Watch mode for TDD
npm run test:unit -- --watch

# Coverage report
npm run test:backend -- --coverage
```

## ✅ Test Categories

### Unit Tests (`unit/`)

**Purpose**: Test business logic in isolation with mocked dependencies.

**Characteristics**:
- ✅ Fast execution (<100ms per test)
- ✅ No database access
- ✅ All dependencies mocked
- ✅ Focus on edge cases and validation

**Example**:
```typescript
import { showService } from '@/services/shows/show.service';
import { showRepository } from '@/repositories';

jest.mock('@/repositories');

describe('ShowService', () => {
    it('should validate ticket price is positive', async () => {
        await expect(
            showService.createShow(userId, { ticketPrice: -100 })
        ).rejects.toThrow(ValidationError);
    });
});
```

### Integration Tests (`integration/`)

**Purpose**: Test complete API flows with real database.

**Characteristics**:
- ✅ Real PostgreSQL test database
- ✅ Database reset before each test
- ✅ Full HTTP request/response cycle
- ✅ Tests middleware and authentication

**Example**:
```typescript
import request from 'supertest';
import { app } from '@/app';
import { resetDatabase } from '../utils/reset-db';

describe('POST /api/v1/shows', () => {
    beforeEach(async () => {
        await resetDatabase();
    });

    it('should create show for verified organizer', async () => {
        const token = await createAuthToken({ role: 'ORGANIZER_VERIFIED' });
        
        const response = await request(app)
            .post('/api/v1/shows')
            .set('Authorization', `Bearer ${token}`)
            .send(validShowData);

        expect(response.status).toBe(201);
    });
});
```

### Security Tests (`security/`)

**Purpose**: Verify RBAC enforcement and prevent unauthorized access.

**Example**:
```typescript
it('should deny AUDIENCE from creating shows', async () => {
    const token = await createAuthToken({ role: 'AUDIENCE' });
    
    const response = await request(app)
        .post('/api/v1/shows')
        .set('Authorization', `Bearer ${token}`)
        .send(showData);

    expect(response.status).toBe(403);
});
```

### Contract Tests (`contract/`)

**Purpose**: Validate API responses conform to `@comedy-connect/types`.

**Example**:
```typescript
import type { ShowResponse } from '@comedy-connect/types';

it('should return ShowResponse structure', async () => {
    const response = await request(app).get('/api/v1/shows');
    
    const show: ShowResponse = response.body.shows[0];
    expect(show).toHaveProperty('id');
    expect(typeof show.ticketPrice).toBe('number');
});
```

## 🛠️ Test Utilities

### Fixtures (`fixtures/`)

Pre-built test data for common scenarios:

```typescript
import { createTestUser, createTestShow, createTestBooking } from '../fixtures';

const user = await createTestUser({ role: 'AUDIENCE' });
const show = await createPublishedShow(organizerId);
const booking = await createConfirmedBooking(user.id, show.id);
```

### Auth Helper (`helpers/auth-helper.ts`)

Generate JWT tokens for authenticated requests:

```typescript
import { createAuthToken, createAdminToken } from '../helpers/auth-helper';

const token = await createAuthToken({ role: 'ORGANIZER_VERIFIED' });
const adminToken = await createAdminToken();
```

### API Client (`helpers/api-client.ts`)

Cleaner syntax for API testing:

```typescript
import { createApiClient } from '../helpers/api-client';

const client = createApiClient(app);
client.authenticate(token);

const response = await client.get('/api/v1/shows', { city: 'Hyderabad' });
```

### Database Reset (`utils/reset-db.ts`)

Clean slate for each test:

```typescript
import { resetDatabase } from '../utils/reset-db';

beforeEach(async () => {
    await resetDatabase(); // Truncates all tables
});
```

## 📝 Writing New Tests

### Test Structure (AAA Pattern)

```typescript
describe('FeatureName', () => {
    beforeEach(async () => {
        // Setup: Reset DB, create fixtures
        await resetDatabase();
    });

    it('should perform expected behavior', async () => {
        // Arrange: Set up test data
        const user = await createTestUser();
        
        // Act: Execute the operation
        const result = await service.doSomething(user.id);
        
        // Assert: Verify the outcome
        expect(result).toBeDefined();
        expect(result.success).toBe(true);
    });
});
```

### Best Practices

✅ **DO**:
- Use descriptive test names
- Test one behavior per test
- Use fixtures and factories
- Reset database in `beforeEach`
- Mock external dependencies in unit tests
- Test error cases and edge cases

❌ **DON'T**:
- Share state between tests
- Use hardcoded IDs
- Test implementation details
- Skip cleanup in `afterEach`
- Mix unit and integration test concerns

## 🐛 Debugging Tests

```bash
# Run single test in watch mode
npm run test:unit -- show.service.test.ts --watch

# Run with verbose output
npm run test:backend -- --verbose

# Run only tests matching pattern
npm run test:backend -- --testNamePattern="should create show"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📊 Coverage

View coverage reports:

```bash
npm run test:backend -- --coverage
open coverage/lcov-report/index.html
```

**Coverage Targets**:
- Services: >90%
- Repositories: >80%
- Overall: >80%

## 🔍 Common Issues

### Database Connection Errors

**Problem**: Tests fail with `DATABASE_URL` errors

**Solution**: Ensure `.env.test` exists with test database URL

### Tests Fail Randomly

**Problem**: Flaky tests due to shared state

**Solution**: Ensure `resetDatabase()` in `beforeEach` and no global state

### Slow Tests

**Problem**: Integration tests are slow

**Solution**: Mock external dependencies, use `maxWorkers: 1` in jest.config

## 🔗 Related Documentation

- [Main Testing Guide](../../../docs/TESTING.md)
- [Frontend Testing](../../frontend/testing/README.md)
- [E2E Testing](../../../testing/e2e/README.md)
