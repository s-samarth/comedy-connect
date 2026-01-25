# Testing Guide

Comedy Connect uses **Jest** and **Supertest** for its comprehensive test suite. In the monorepo, tests are split between levels.

## 🧪 Test Hierarchy

### 1. Backend Unit & Integration Tests
Located in `packages/backend/testing`. These test the core business logic, API endpoints, and database interactions.

**Run Commands:**
```bash
# From Root
npm run test:backend

# From Backend Package
cd packages/backend
npm run test:all
npm run test:unit
npm run test:integration
```

### 2. Security Tests
Verifies that RBAC (Role-Based Access Control) is strictly enforced at the API level.
```bash
npm run test:security
```

### 3. Frontend Testing (Planned)
Component testing for UI logic using React Testing Library.

---

## 🛠️ Testing Environment Setup

### 1. Test Database
Tests require a dedicated PostgreSQL instance.
1. Configure `.env.test` in the backend.
2. Run migrations for the test database:
   ```bash
   DATABASE_URL=... npx prisma migrate deploy
   ```

### 2. Mock Data
Automation cleanup scripts are used to ensure tests start from a clean state:
`packages/backend/scripts/cleanup-test-artifacts.ts`

---

## 📝 Writing New Tests

### API Test Example
Stored in `packages/backend/testing/api/*.test.ts`:
```typescript
import request from 'supertest';
// ... test logic
```

### Key Areas to Cover
- **Bookings**: Atomic inventory decrement.
- **Auth**: Redirects and session validation.
- **Admin**: Multi-tier password verification.
- **Validation**: Input sanitization and error responses.
