# 🎭 Comedy Connect — Testing Architecture

> [!IMPORTANT]
> This document is the **Single Source of Truth** for testing in Comedy Connect.
> It defines the decoupled testing strategy for the monorepo.

## 1. Testing Philosophy
The Comedy Connect architecture is decoupled (Frontend vs Backend). Our testing strategy reflects this:
1.  **Strict Boundaries**: Frontend tests never touch the database. Backend tests never rely on the UI.
2.  **Environment Safety**: Environment variables are strictly controlled. Tests fail if unsafe access is detected.
3.  **Real Business Risk**: Tests prioritize critical flows (Bookings, Money, Auth/RBAC).
4.  **Deterministic**: Tests run in isolation with dedicated DB schemas and automatic teardown.

---

## 2. New Testing Folder Structure

```
packages/
├── backend/
│   ├── testing/
│   │   ├── unit/            # Service logic, Utilities (No DB)
│   │   ├── integration/     # API endpoints, DB interactions (Real DB)
│   │   ├── security/        # RBAC, Auth checks, Privilege escalation
│   │   ├── contract/        # Type conformity against @comedy-connect/types
│   │   ├── setup.ts         # Global test setup (Env loaders)
│   │   └── teardown.ts      # Global teardown (DB Cleanup)
│   └── prisma/
│       └── schema.prisma    # Source of truth for DB
├── frontend/
│   ├── testing/
│   │   ├── components/      # RTL Tests (UI Behavior)
│   │   ├── hooks/           # Custom React Hooks
│   │   ├── mocks/           # MSW Handlers & Data fixtures
│   │   └── setup.ts         # Vitest setup for DOM
└── testing/                 # Shared Test Configs
    ├── jest.backend.ts      # Backend-specific Jest Config
    ├── vitest.frontend.ts   # Frontend-specific Vitest Config
    └── e2e/                 # Playwright E2E Tests (Critical Flows)
```

---

## 3. Test Layers & Taxonomy

### 🟢 Backend (Source of Truth)
**Location:** `packages/backend/testing/`
**Technique:** Jest + Supertest + Prisma
**Database:** Real PostgreSQL (Test Instance)

| Type | Scope | Goal |
| :--- | :--- | :--- |
| **Unit** | `testing/unit/*.test.ts` | Verify pure business logic (e.g., Ticket counts, Fee calc). **No DB.** |
| **Integration** | `testing/integration/*.test.ts` | Verify API endpoints, Middleware, and DB queries/migrations. |
| **Security** | `testing/security/*.test.ts` | Verify RBAC, invalid sessions, and admin-only routes. |
| **Contract** | `testing/contract/*.test.ts` | Verify API responses match `packages/types`. |

### 🔵 Frontend (Consumer)
**Location:** `packages/frontend/testing/`
**Technique:** Vitest + React Testing Library + MSW
**Database:** ❌ FORBIDDEN

| Type | Scope | Goal |
| :--- | :--- | :--- |
| **Component** | `testing/components/*.test.tsx` | UI interactions (Clicks, Forms, Loading states). |
| **Hooks** | `testing/hooks/*.test.ts` | Verify complex state logic (e.g., AuthProvider). |
| **Integration** | `testing/pages/*.test.tsx` | Page-level flows using **Mocked APIs (MSW)**. |

### 🟣 End-to-End (E2E)
**Location:** `testing/e2e/` (Root)
**Technique:** Playwright (or Cypress)
**Database:** Real Backend + Real DB

> **Rule:** Only test **Business Critical** flows here.
> 1. User Browse -> Login -> Book Ticket -> View Confirmation
> 2. Organizer Create Show -> Publish -> Discovery

---

## 4. Commands to Run (Proposed)

### Backend
```bash
# Run all backend tests
npm run test:backend

# Granular
npm run test:backend:unit
npm run test:backend:integration
npm run test:backend:security
```

### Frontend
```bash
# Run all frontend tests
npm run test:frontend

# Watch mode for dev
npm run test:frontend:watch
```

### E2E
```bash
# Run critical user flows
npm run test:e2e
```

---

## 5. Environment Variable Strategy (ABSOLUTE RULES)

> [!CAUTION]
> **Strict Enforcement**: Tests will FAIL via a custom loader if they attempt to read unsafe env files.

1.  **Allowed Sources**:
    - `.env.test` (Committed defaults)
    - `.env.test.local` (Local overrides, gitignored)
    - `.env` (Production safe)
    - `process.env` (CI injection)

2.  **Forbidden Sources**:
    - `.env.prod`
    - `.env.dev`

3.  **Implementation**:
    A `loadTestEnv()` utility will be created in `packages/backend/testing/utils/env-loader.ts`. It explicitly loads only allowed files and throws if critical keys (e.g. `DATABASE_URL`) are missing or look like production URLs.

---

## 6. CI Execution Plan

Tests run in parallel stages on GitHub Actions.

1.  **Stage 1: Unit & Contract (Fast)**
    - Run `test:backend:unit`
    - Run `test:frontend` (Components)
    - Run `lint` & `type-check`

2.  **Stage 2: Integration (Database Required)**
    - Spin up Postgres Service
    - Run `test:backend:integration`
    - Run `test:backend:security`

3.  **Stage 3: E2E (Critical)**
    - Deploy Ephemeral Env (or start local full stack)
    - Run `test:e2e`

---

## 7. Migration Plan

How to move from the old setup to this new architecture:

1.  **Phase 1 (Setup)**:
    - Create the directory structure.
    - Install `vitest`, `msw`, `playwright`.
    - Create the `loadTestEnv` utility.

2.  **Phase 2 (Backend Port)**:
    - Move existing `packages/backend/testing/*.test.ts` to `testing/integration/`.
    - Refactor them to use the new `setup.ts` (DB cleanup).

3.  **Phase 3 (Frontend Init)**:
    - Write the first "Smoke Test" for the Sign-In component using MSW.
    - Ensure it passes without any backend running.

4.  **Phase 4 (Strictness)**:
    - Delete old `docs/TESTING.md`.

---

## 8. Anti-Patterns (AVOID)

- ❌ **Shared State**: Never rely on data created by a previous test. Every test must start clean.
- ❌ **Mixed Concerns**: Frontend tests should NOT import Prisma or backend types (except shared types).
- ❌ **Hardcoded IDs**: Never assume `Booking ID 1` exists. Always create what you need.
- ❌ **Leaky Mocks**: MSW handlers should reset after every test.
- ❌ **Testing Libraries in Prod**: Ensure `msw`, `faker` etc., are in `devDependencies`.

---
*Generated by Antigravity for Comedy Connect.*
