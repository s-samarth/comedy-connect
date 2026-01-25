# Comedy Connect - Monorepo

> **Architecture Status**: Phase 1 & 2 Complete ✅  
> Backend and frontend are now separated with dual-mode support.

## 🏗️ Architecture

This is a **monorepo** containing:

- **`packages/backend`** - Standalone API service (port 4000)
- **`packages/frontend`** - UI application (port 3000)  
- **`packages/types`** - Shared TypeScript types

### Key Feature: Dual-Mode Operation

The frontend can operate in **two modes**:

1. **Legacy Mode** (default): Uses original monolith API routes
2. **New Backend Mode**: Calls standalone backend service

Switch modes via environment variable - **no code changes required**.

---

## 🚀 Quick Start

### Backend (Port 4000)

```bash
cd packages/backend
npm install
npx prisma generate
npm run dev
```

**Health Check**: http://localhost:4000/api/health

### Frontend (Port 3000)

```bash
cd packages/frontend
npm install
npm run dev
```

**Application**: http://localhost:3000

---

## 🔧 Configuration

### Frontend Mode Switching

Edit `packages/frontend/.env.local`:

```bash
# Legacy mode (uses monolith)
NEXT_PUBLIC_USE_NEW_BACKEND=false

# New backend mode (uses standalone backend)
NEXT_PUBLIC_USE_NEW_BACKEND=true
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

**Restart required**: Yes (Next.js dev server)

---

## 📚 Documentation

- **[Implementation Plan](/.gemini/antigravity/brain/.../implementation_plan.md)** - Complete decoupling strategy
- **[Walkthrough](/.gemini/antigravity/brain/.../walkthrough.md)** - Phase 1 & 2 completion details
- **[Original README](/README.md)** - Original Comedy Connect documentation

---

## 📁 Package Details

### Backend (`packages/backend`)

- **Purpose**: API service with business logic, auth, and database access
- **Port**: 4000
- **Dependencies**: Next.js, Prisma, NextAuth, Cloudinary, Razorpay
- **API Routes**: All 17 original route groups (auth, shows, bookings, admin, etc.)

**Key Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test:integration` - Run integration tests

### Frontend (`packages/frontend`)

- **Purpose**: UI application (no API routes)
- **Port**: 3000
- **Dependencies**: Next.js, React, SWR, Tailwind CSS
- **Features**: Dual-mode API client, custom hooks (useAuth, useShows, etc.)

**Key Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production

### Types (`packages/types`)

- **Purpose**: Shared TypeScript definitions
- **Files**: API request/response types, entity models
- **Usage**: Imported by both frontend and backend

---

## 🧪 Testing

### Test Backend Independently

```bash
# Health check
curl http://localhost:4000/api/health

# Get shows
curl http://localhost:4000/api/shows

# Check session
curl http://localhost:4000/api/auth/session
```

### Test Frontend with Backend

1. Start backend: `cd packages/backend && npm run dev`
2. Edit `packages/frontend/.env.local`:
   ```bash
   NEXT_PUBLIC_USE_NEW_BACKEND=true
   NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
   ```
3. Start frontend: `cd packages/frontend && npm run dev`
4. Open http://localhost:3000
5. Verify API calls go to port 4000 (check Network tab)

---

## 🔄 Migration Status

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Complete | Backend extracted to standalone service |
| 2 | ✅ Complete | Frontend with dual-mode API client |
| 3 | 📋 Planned | Update components to use hooks |
| 4 | 📋 Planned | Incremental endpoint migration |
| 5 | 📋 Planned | Production cutover |
| 6 | 📋 Planned | Remove legacy code |

See `implementation_plan.md` for full details.

---

## 🤝 Development Workflow

### For Frontend Engineers

Work in `packages/frontend/`:
- no backend knowledge needed
- Use custom hooks (useAuth, useShows, etc.)
- Test against staging backend or local backend

### For Backend Engineers

Work in `packages/backend/`:
- Full API ownership
- Test endpoints in isolation
- Frontend uses your API via hooks

### Collaboration

- Share types via `packages/types/`
- Backend changes auto-reflect in frontend (TypeScript errors)
- Independent deployment pipelines

---

## 📝 Important Notes

1. **Original code intact**: The root `/app`, `/lib`, `/components` still exist
2. **Shared database**: Both modes use the same PostgreSQL database
3. **Authentication works**: NextAuth sessions compatible with both modes
4. **No migration required**: Instant switching via environment variable

---

## 🎯 Next Steps

1. Update frontend components to use custom hooks
2. Test full integration (auth, bookings, admin)
3. Begin incremental production migration

See walkthrough.md for detailed next steps.

---

**Questions?** Check the implementation plan or walkthrough documents.
