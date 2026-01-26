# Database Schema & Management

Comedy Connect uses **PostgreSQL** with **Prisma ORM**. The database is the single source of truth for both the Frontend and Backend services.

## 🗄️ Database Architecture

The database is managed exclusively by the **Backend Package** (`packages/backend`).

### Location
The schema and migrations reside in:
`packages/backend/prisma/schema.prisma`

---

## 📊 Core Models

### User & Identity
- **User**: Stores profile, roles (`AUDIENCE`, `ORGANIZER`, `COMEDIAN`, `ADMIN`), and onboarding status.
- **Account/Session**: NextAuth.js tables for OAuth and session tracking.

### Profiles
- **OrganizerProfile**: Extended info for show organizers, tracks admin approval status.
- **ComedianProfile**: Professional details for verified comedians.

### Events & Bookings
- **Show**: Details of comedy events, ticket pricing, and venue info.
- **TicketInventory**: Real-time tracking of available and locked tickets.
- **Booking**: Customer ticket purchases, platform fees, and payment status.

### System Configuration
- **PlatformConfig**: Global settings like default platform fees and convenience fee slabs.

---

## 🔄 Management Workflow

### 1. Making Changes
All schema changes must be performed within the backend directory:
```bash
cd packages/backend
npx prisma migrate dev --name <migration_name>
```

### 2. Generating the Client
The Prisma client is generated into the shared node_modules to be accessible by all backend logic:
```bash
cd packages/backend
npx prisma generate
```

### 3. Seeding Data
Seed the database with mock shows and users:
```bash
cd packages/backend
npm run seed
```

---

## 🧪 Data Integrity

- **Transactions**: Atomic operations are used for bookings to ensure `TicketInventory` is always accurate.
- **Enums**: Roles and Statuses are enforced at the database level.
- **Foreign Keys**: Cascading deletes are configured for accounts and sessions to maintain cleanliness.
- **Account Deletion**: Manual account deletion triggers a transactional cleanup in the backend that purges user-created Shows, Comedians, and Bookings to ensure no orphaned data remains.
- **Data Access Layer**: All database queries are isolated in the `packages/backend/repositories` directory, separated from business logic.
