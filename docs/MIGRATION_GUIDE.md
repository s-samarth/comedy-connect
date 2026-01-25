# Migration Guide: Monolith to Decoupled Architecture

This document details the step-by-step process used to migrate **Comedy Connect** from a monolithic Next.js application to a decoupled Monorepo architecture. 

## 🏗️ Overview of the Change

The goal was to separate the **Frontend (UI)** from the **Backend (API)** to allow independent development, testing, and deployment.

### Before: Monolith
- **Location**: All code in the root directory.
- **Coupling**: UI components directly mixed with API routes and database logic.
- **Deployment**: Single deployment unit (Next.js on Vercel).

### After: Decoupled Monorepo
- **Structure**: Lerna/npm-style monorepo.
- **Frontend**: Pure UI consumer in `packages/frontend`.
- **Backend**: Standalone API service in `packages/backend`.
- **Types**: Shared contracts in `packages/types`.
- **Communication**: REST API over HTTP (port 4000 for backend).

---

## 📅 Migration Timeline

The migration followed a 6-phase plan to ensure **zero production downtime**.

### Phase 1: Backend Extraction (Week 1)
1. **Created `packages/backend`**: A new Next.js project configured as a standalone API service.
2. **Copied API Routes**: Moved `app/api/*` to `packages/backend/app/api/v1/*`.
3. **Internal Libs**: Moved `lib/prisma.ts`, `lib/auth.ts`, etc., to the backend.
4. **Prisma Schema**: Shared the database schema by moving the `prisma/` folder to the backend.
5. **Port Configuration**: Backend configured to run on port `4000`.

### Phase 2: Shared Types (Week 1)
1. **Created `packages/types`**: A shared package for TypeScript interfaces.
2. **API Contracts**: Defined `ShowResponse`, `CreateBookingRequest`, etc., to ensure both FE and BE speak the same language.
3. **Workspace Integration**: Linked types to both packages using npm workspaces.

### Phase 3: Frontend Refactoring (Week 2)
1. **Created `packages/frontend`**: Moved `app/` (pages) and `components/` here.
2. **API Client**: Implemented a `lib/api/client.ts` with **Dual-Mode** support.
   - **Mode 1 (Legacy)**: Calls `/api/*` (same origin).
   - **Mode 2 (New)**: Calls `http://localhost:4000/api/v1/*`.
3. **Data Fetching Hooks**: Replaced direct `fetch()` calls with SWR-based hooks (e.g., `useShows`, `useAuth`).

### Phase 4: Incremental Rollout (Week 3-4)
1. **Read-Only Migration**: Switched public show listings to the new backend.
2. **Auth Migration**: Switched login/session management.
3. **Write Operations**: Carefully migrated bookings (atomic transactions).
4. **Validation**: Verified data consistency between old and new systems.

### Phase 5: Architecture Refactor (Jan 2026)
1. **Clean Architecture**: Refactored the backend to a layered **Service/Repository pattern**.
2. **Repository Layer**: Isolated all Prisma queries in specialized repository classes.
3. **Service Layer**: Moved business logic, validation, and complex calculations (like fees) out of route handlers and into services.
4. **Domain Errors**: Introduced structured error handling to separate HTTP concerns from domain logic.
5. **Decoupling**: Decoupled the auth library (`lib/auth.ts`) from direct database access using the `UserRepository`.

---

## 🛠️ Technical Details of the Split

### 1. The Dual-Mode API Client
To allow a safe transition, the frontend includes a toggle:

```typescript
// packages/frontend/lib/api/client.ts
const USE_NEW_BACKEND = process.env.NEXT_PUBLIC_USE_NEW_BACKEND === 'true';
const BASE_URL = USE_NEW_BACKEND ? process.env.NEXT_PUBLIC_BACKEND_URL : '';
```

### 2. Authentication Flow
- **NextAuth.js**: Remained the primary auth provider.
- **Shared Session**: Both services share the same `NEXTAUTH_SECRET` and Database.
- **Cross-Origin**: CORS headers configured in the backend to allow requests from the frontend origin.

### 3. Database Management
- **Prisma Client**: Generated within the backend package.
- **Connections**: Both systems can connect to the same PostgreSQL instance during the transition.

---

## ⚠️ Risks and Mitigations

| Risk | Mitigation |
| :--- | :--- |
| **CORS Issues** | Configured `Access-Control-Allow-Credentials: true` and explicit origin whitelisting. |
| **Session Loss** | Ensured `NEXTAUTH_URL` and cookie domains are correctly set for cross-service auth. |
| **Race Conditions** | Kept Prisma transactions intact within the backend service. |
| **Deployment Sync** | Used a versioned API (`/v1/`) to prevent breaking the frontend during backend updates. |

---

## 🔄 Rollback Strategy

1. **Frontend Toggle**: If the new backend fails, set `NEXT_PUBLIC_USE_NEW_BACKEND=false` in environment variables.
2. **Traffic Reversion**: Frontend reverts to calling the internal `/api` routes of the monolith app.
3. **Zero Code Change**: No redeploy required if using dynamic environment variables.

---

## ✅ Post-Migration Checklist
- [x] All 17 API route groups verified on port 4000.
- [x] SWR hooks implemented for all data-fetching components.
- [x] Auth session persists across service boundaries.
- [x] Database migrations managed solely by the backend package.
- [x] Global types package linked and validating API contracts.
