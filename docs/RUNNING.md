# Running Instructions (Local Development)

This guide explains how to run the decoupled Comedy Connect monorepo on your local machine.

## 🛠️ Prerequisites
- **Node.js**: v18 or v20+
- **Database**: PostgreSQL instance running (Local or Cloud)
- **Environment**: Root `.env` file with proper credentials (see `packages/backend/.env.example`)

---

## 🏃 Quick Start (Standard Mode)

The simplest way to run the project is using the root workspace scripts.

### 1. Initial Setup
```bash
# Install all dependencies for all packages
npm install

# Generate Prisma Client (in the backend package)
cd packages/backend
npx prisma generate
cd ../..
```

### 2. Start Both Services
You will need two terminal windows.

**Terminal 1: Backend API (Port 4000)**
```bash
npm run dev:backend
```

**Terminal 2: Frontend UI (Port 3000)**
```bash
cd packages/frontend
npm run dev
```

---

## 🔧 Mode Configurations

The Frontend can operate in two modes, controlled by `packages/frontend/.env.local`.

### Mode A: Legacy Monolith (Default)
In this mode, the frontend calls its own internal `/api` routes.
```bash
# packages/frontend/.env.local
NEXT_PUBLIC_USE_NEW_BACKEND=false
```

### Mode B: Decoupled Backend
In this mode, the frontend calls the standalone backend service on port 4000.
```bash
# packages/frontend/.env.local
NEXT_PUBLIC_USE_NEW_BACKEND=true
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
API_URL=http://localhost:4000
```

---

## 🗃️ Database Operations

All database management is handled through the **Backend Package**.

- **Migrate**: `cd packages/backend && npx prisma migrate dev`
- **Studio**: `cd packages/backend && npx prisma studio`
- **Seed**: `cd packages/backend && npm run seed`

---

## 🧪 Testing

### Backend Tests
```bash
# Run all backend tests
npm run test:backend

# Run specific suite (e.g., security)
cd packages/backend
npm run test:security
```

### Health Check
Verify the backend is active:
```bash
curl http://localhost:4000/api/health
```
