# Authentication & Security

 Comedy Connect uses **NextAuth.js** for authentication and a comprehensive role-based access control (RBAC) system.

## Authentication Flow

### Google OAuth
- **Provider**: Google is the primary identity provider.
- **Flow**:
  1. User clicks "Sign In".
  2. Redirected to Google for consent.
  3. On success, NextAuth creates or updates the `User` record.
  4. User name and image are synced from Google profile.

### Session Management
- Sessions are database-persisted.
- The `User` model is extended to include the `role` field in the session object, making it accessible client-side.

## Role-Based Access Control (RBAC)

Permissions are enforced at both the API and Page levels.

| Role | Capabilities |
| :--- | :--- |
| **AUDIENCE** | Browse shows, Book tickets, View own bookings. |
| **ORGANIZER_UNVERIFIED** | Create organizer profile, Wait for approval. |
| **ORGANIZER_VERIFIED** | Create/Edit Shows, Manage Bookings, View Analytics. |
| **COMEDIAN_UNVERIFIED** | Create Profile, Wait for verification. |
| **COMEDIAN_VERIFIED** | Create/Edit Shows, Manage Profile, Custom Fees. |
| **ADMIN** | Full Access, Manage Users, Finance Dashboard. |

## Middleware Protection

The `middleware.ts` file intercepts requests to protected routes:
- **`/admin/*`**: Restricted to `ADMIN` role.
- **`/organizer/*`**: Restricted to `ORGANIZER_VERIFIED` role.
- **`/comedian/*`**: Restricted to authenticated users (Role checked on page).
- **`/bookings/*`**: Restricted to authenticated users.

## Admin Security

Administrative functions have an additional layer of security:
- **Secondary Password**: Admins must authenticate with a separate password to access critical endpoints (`/api/admin-secure`).
- **Password Hashing**: Admin passwords are securely hashed using bcrypt.
