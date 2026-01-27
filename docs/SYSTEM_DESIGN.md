# Comedy Connect - System Design Document

## 1. Architecture Overview

Comedy Connect is built as a **Decoupled Monorepo**, separating the user interface from the business logic and data access layers.

### 🏗️ Monorepo Structure
- **`packages/frontend`**: A Next.js 14+ application using the App Router. It acts as a pure UI consumer.
- **`packages/backend`**: A standalone Next.js-based API service that handles all business logic, authentication, and database interactions.
- **`packages/types`**: A shared TypeScript package that defines API contracts (request/response types) and entity models, ensuring type safety across the stack.

### 🔄 Dual-Mode Operation
A unique feature of this project is its **Dual-Mode Support**. The frontend can be toggled via environment variables (`NEXT_PUBLIC_USE_NEW_BACKEND`) to use either:
1.  **Legacy Internal API**: Routes located within the frontend package (monolithic approach).
2.  **Standalone Backend Service**: The new decoupled API service (modern approach).

---

## 2. Backend Design Patterns

The backend service follows a structured approach to maintain clean code and separation of concerns.

### 🏗️ Service/Repository Architecture
-   **Controllers (API Routes)**: Handle incoming HTTP requests, perform basic validation, and delegate to Services.
-   **Services**: Contain the core business logic, such as complex fee calculations, inventory management, and integration orchestration (e.g., Cloudinary, Razorpay).
-   **Repositories**: Encapsulate all database interactions using Prisma ORM. This isolates the data access logic from the business rules.

### 🛡️ Error Handling & Validation
-   Custom error classes (e.g., `ValidationError`, `BookingError`, `NotFoundError`) provide consistent error responses across the API.
-   Input validation is performed at the service level to ensure data integrity before it reaches the repository.

---

## 3. Database & Core Logic

### 🗄️ Persistence Layer
-   **PostgreSQL**: The primary relational database.
-   **Prisma ORM**: Used for type-safe database access, schema management, and migrations.

### 🎟️ Booking & Fee System
The system implements a dual-fee structure:
-   **Platform Fee**: A percentage (default 8%) deducted from the Creator's (Organizer/Comedian) earnings. This can be overridden at the user or show level.
-   **Booking Fee**: A customer-facing surcharge added to the ticket price. This is calculated dynamically based on price slabs defined in `PlatformConfig`.

### 🔄 Concurrency & Inventory
-   **Atomic Transactions**: The `BookingService` utilizes Prisma transactions to ensure that booking creation and ticket inventory updates happen atomically, preventing overbooking.
-   **Inventory State**: Tickets are moved from `available` to `locked` (or sold) within a single transaction during the booking process.

---

## 4. Authentication & Security

### 🔐 Auth Layers
-   **NextAuth.js**: Handles standard Google OAuth for audience, organizers, and comedians. Sessions are backed by the database.
-   **Admin Secure Session**: High-stakes administrative actions require a second layer of authentication, using a signed `admin-secure-session` cookie.

### 🛡️ RBAC & Middleware
-   **Role-Based Access Control**: Enforced through middleware and service-level checks (`AUDIENCE`, `ORGANIZER`, `COMEDIAN`, `ADMIN`).
-   **CORS**: The backend explicitly whitelists the frontend origins to allow secure cross-origin communication in the decoupled setup.

---

## 5. Review & Evaluation

### ✅ Strengths
-   **Scalability**: Independent scaling of frontend and backend services.
-   **Maintainability**: Clean separation of concerns through the Service/Repository pattern.
-   **Robustness**: Atomic transactions for critical flows like bookings.
-   **Developer Experience**: Shared types reduce communication overhead and bugs.

### ⚠️ Limitations
-   **Architecture Complexity**: Maintaining dual-mode support adds overhead if not managed carefully.
-   **Transaction Intensity**: Complex transactions in a high-traffic environment can become a bottleneck.

---

## 6. Next Logical Steps

1.  **Full Decoupling**: Once stability is verified, remove the legacy internal API and move exclusively to the standalone backend.
2.  **Razorpay Completion**: Finalize the payment webhook integration for real-world transactions.
3.  **Enhanced Monitoring**: Implement comprehensive logging and monitoring for both services (e.g., Sentry, Datadog).
4.  **Admin UI Expansion**: Build more advanced financial reporting and user management tools in the Admin Dashboard.
