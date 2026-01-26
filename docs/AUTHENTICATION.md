# Authentication & Security

Comedy Connect uses a robust, dual-layered authentication system designed to handle both standard users (Audience, Organizers, Comedians) and secure administrative access.

## 🔐 Authentication Architecture

In the decoupled architecture, the **Backend Service** manages all authentication logic. Data access for users is abstracted into the `UserRepository`.

### 1. NextAuth.js (Standard Users)
- **Provider**: Google OAuth.
- **Session Strategy**: Database-backed sessions using the Prisma Adapter.
- **Handling**: 
  - Frontend redirects to `${BACKEND_URL}/api/auth/signin`.
  - Backend sets a `next-auth.session-token` cookie.
  - Subsequent requests from Frontend include `credentials: 'include'`.

### 2. Admin Secure Session (Administrative Users)
- **Method**: Secure password-based session.
- **Cookie**: `admin-secure-session`.
- **Logic**: Used for high-stakes administrative actions to prevent session hijacking.

---

## 🛡️ Security Layers

### 1. Role-Based Access Control (RBAC)
Middleware in the backend verifies the user's role stored in the database before proceeding with protected actions.

| Route Prefix | Required Role |
| :--- | :--- |
| `/api/v1/admin/*` | `ADMIN` |
| `/api/v1/organizer/*` | `ORGANIZER_VERIFIED` or `ADMIN` |
| `/api/v1/comedian/profile` (POST) | `COMEDIAN_UNVERIFIED` (to claim) |
| `/api/v1/bookings` (POST) | Any Authenticated User |

### 2. CORS (Cross-Origin Resource Sharing)
The backend explicitly whitelists the frontend origins:
- `http://localhost:3000` (Dev)
- `https://comedyconnect.com` (Production)

### 3. CSRF Protection
- **Standard**: NextAuth.js automatically handles CSRF tokens for sensitive state-changing operations.
- **Backend**: Verifies the origin and referer of incoming requests.

### 4. Session Destruction (Account Deletion)
When a user deletes their account via the Profile settings, the backend purges the user record which cascades to the active `Session` records in the database. Simultaneously, the frontend triggers a `signOut()` call to clear client-side auth cookies and redirect the user.

---

## 🛠️ Configuration

The following environment variables must be consistent between services:
- `NEXTAUTH_SECRET`: Used to sign session tokens.
- `DATABASE_URL`: Must point to the same database to share user session data.
