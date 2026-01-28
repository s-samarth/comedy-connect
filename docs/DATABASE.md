# Database Schema & Management

Comedy Connect uses **PostgreSQL** with **Prisma ORM**. The database is the single source of truth for both the Frontend and Backend services.

## 🗄️ Database Architecture

The database is managed exclusively by the **Backend Package** (`packages/backend`).

### Location
The schema and migrations reside in:
`packages/backend/prisma/schema.prisma`

### Database Environments
We maintain strict separation between environments:
1.  **Production** (`.env.prod`): Live data.
2.  **Pre-Production** (`.env.dev`): Staging/Test data.
3.  **Development** (`.env`): Local playground data.

---

## 📊 Core Models

### User & Identity
- **User**: Stores profile, roles (`AUDIENCE`, `ORGANIZER`, `COMEDIAN`, `ADMIN`), and onboarding status.
- **Account/Session**: NextAuth.js tables for OAuth and session tracking.

### Profiles
- **OrganizerProfile**: Extended info for show organizers, tracks admin approval status.
- **ComedianProfile**: Professional details for verified comedians.

### Events & Bookings
- **Show**: Details of comedy events, ticket pricing, venue info, and duration.
- **TicketInventory**: Real-time tracking of available and locked tickets.
- **Booking**: Customer ticket purchases.
    - **Platform Fee**: Money (percentage of show revenue) taken from Organizers/Comedians. Often labeled as **Platform Commission** in Admin UI.
    - **Booking Fee**: Money taken from the Customer per ticket (added to price).

### System Configuration
- **PlatformConfig**: Global settings like default platform fees and convenience fee slabs.
    - `booking_fee_slabs`: A JSON array defining ticket price ranges and their corresponding booking fee percentages.

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

- **Transactions**: Atomic operations are used for bookings to ensure `TicketInventory` is always accurate. The `BookingService` manages these transactions to handle inventory updates and fee calculations together.
- **Enums**: Roles and Statuses are enforced at the database level.
- **Foreign Keys**: Cascading deletes are configured for accounts and sessions to maintain cleanliness.
- **Account Deletion**: A comprehensive transactional cleanup in the backend (`user.repository.ts`) ensures that when a user is deleted, all their associated data including owned Shows, Comedians, and Bookings are purged to maintain data integrity. Unpublished shows and drafts are removed, while published shows may have restrictions on deletion if they have active bookings.
- **Data Access Layer**: All database queries are isolated in the `packages/backend/repositories` directory, separated from business logic in `packages/backend/services`.
