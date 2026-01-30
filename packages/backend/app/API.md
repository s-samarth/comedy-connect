# API Documentation (v1)

This document describes the REST API endpoints provided by the **Comedy Connect Backend Service**. 

## 🌐 Base URL
- **Local**: `http://localhost:4000`
- **Production**: `https://api.comedyconnect.com`

---

## 🏗️ Architecture
The backend follows a **Service/Repository architecture**.
- **Services**: Contain all business logic, fee calculations, and validation.
- **Repositories**: Handle all data access via Prisma.
- **Controllers**: Thin Next.js API route handlers that delegate to services.

---

## 🔐 Authentication (`/auth`)

### `GET /api/auth/me`
Retrieves detailed profile info for the authenticated user.
- **Auth Required**: Yes

### `POST /api/auth/check-user`
Checks if a user exists by email.
- **Body**: `{ email: string }`
- **Response**: `{ exists: boolean }`

### NextAuth Routes (`/api/auth/[...nextauth]`)
Standard NextAuth.js routes for OAuth sign-in (Google) and session management.
- Includes sign-in, sign-out, callback, and session endpoints

---

## 🔒 Admin Authentication (`/v1/admin/auth`)

> [!IMPORTANT]
> All admin authentication endpoints require the admin email to be whitelisted in `ADMIN_EMAIL` environment variable.

### `POST /api/v1/admin/auth/login`
Administrator login with email and password.
- **Body**: `{ email: string, password: string }`
- **Response**: Sets `admin-secure-session` cookie
- **Error Codes**:
  - `SETUP_REQUIRED`: Admin account exists but password not set

### `POST /api/v1/admin/auth/logout`
Logs out the admin user.
- **Effect**: Deletes `admin-secure-session` cookie and redirects to login

### `POST /api/v1/admin/auth/setup`
Initial admin account setup (one-time).
- **Body**: `{ email: string, password: string }`
- **Validation**: Password must be at least 8 characters
- **Effect**: Creates admin user and sets password hash

### `POST /api/v1/admin/auth/reset/request`
Request password reset code.
- **Body**: `{ email: string }`
- **Effect**: Generates 6-digit code, valid for 10 minutes, sends via email
- **Dev Mode**: Returns code in response if email fails

### `POST /api/v1/admin/auth/reset/confirm`
Confirm password reset with code.
- **Body**: `{ email: string, code: string, newPassword: string }`
- **Validation**: Code must be valid and not expired

---

## 🚀 Onboarding (`/onboarding`)

### `POST /api/v1/onboarding`
Completes the initial user setup.
- **Auth Required**: Yes
- **Body**: 
    - `name` (string, required)
    - `age` (number, required)
    - `city` (string, required)
    - `watchedComedy` (enum: "yes" | "no", required)
    - `phone` (string, optional)
    - `heardAboutUs` (string, optional)
    - `bio` (string, optional)
    - `interests` (JSON, optional)
- **Effect**: Sets `onboardingCompleted: true`.

---

## 👤 Profile (`/profile`)

### `POST /api/v1/profile/update`
Updates user profile information (Name, Bio, etc.).
- **Auth Required**: Yes
- **Body**: `UpdateProfileRequest`

### `POST /api/v1/profile/delete`
Permanently deletes the user account and all associated data.
- **Auth Required**: Yes
- **Logic**:
    - **Blocked** if user is a verified creator with future published shows.
    - **Restricted** for Admin users.
- **Side Effects**: Deletes sessions, bookings, and owned shows/comedians via a transactional purge.

---

## 🎭 Shows (`/shows`)

### `GET /api/v1/shows`
Lists all public shows (discovery mode) or shows belonging to the user (manage mode).
- **Query Params**:
  - `mode`: `discovery` (default) or `manage`.
- **Response**: `ShowResponse[]`

### `POST /api/v1/shows`
Creates a new show.
- **Auth Required**: Yes (`ORGANIZER_VERIFIED`, `COMEDIAN_VERIFIED`, or `ADMIN`).
- **Body**: `CreateShowRequest`

### `GET /api/v1/shows/:id`
Retrieves details for a specific show.

### `PUT /api/v1/shows/:id`
Updates show details.
- **Auth Required**: Yes (Owner or Admin).
- **Restrictions**:
  - **Completed Shows**: Cannot be edited (past end time).
  - **Published Shows**: Critical fields (Title, Date, Venue, Duration) are locked unless updated by Admin.

### `POST /api/v1/shows/:id/publish`
Publishes a draft show.
- **Auth Required**: Yes (Owner).

### `POST /api/v1/shows/:id/unpublish`
Unpublishes a show (reverts to draft).
- **Auth Required**: Yes (Admin only if already published). Creators can no longer unpublish active shows.

---

## 🎟️ Bookings (`/bookings`)

### `POST /api/v1/bookings`
Creates a new ticket booking.
- **Auth Required**: Yes
- **Body**: 
    - `showId` (string, required)
    - `quantity` (number, required, max 10)
- **Logic**: Performs atomic inventory update using a transaction and calculates:
  - **Platform Fee**: Percentage of revenue deducted from Creator (Organizer/Comedian) earnings.
  - **Booking Fee**: Surcharge added to the customer's total, calculated based on `platformConfig` slabs.

### `GET /api/v1/bookings`
Lists all bookings for the authenticated user.

---

## 🎤 Comedians (`/comedians`)

### `GET /api/v1/comedians`
Lists comedian profiles.

### `POST /api/v1/comedian/profile`
Creates or updates a comedian profile.
- **Auth Required**: Any Authenticated User (Onboarding).

---

## 🛠️ Admin (`/admin`)

> [!IMPORTANT]
> All admin endpoints require the `ADMIN` role.

### `GET /api/v1/admin/stats`
Retrieves system-wide metrics (Revenue, Users, Active Shows).

### `GET /api/v1/admin/collections`
Financial breakdown of show revenue and platform fees. Includes detailed Creator info (Organizer/Comedian).

### `POST /api/v1/admin/comedian-users`
Manage comedian verification applications.

---

## 🖼️ Uploads (`/upload`)

### `POST /api/v1/upload/image`
Uploads an image to Cloudinary.
- **Auth Required**: Yes

---

## ⚡ Webhooks (`/webhooks`)

### `POST /webhooks/razorpay`
Handled payment completion events from Razorpay.

---

## 📦 Request/Response Standards

### Success
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `UNAUTHORIZED`: Authentication missing.
- `FORBIDDEN`: Insufficient permissions.
- `NOT_FOUND`: Resource missing.
- `SOLD_OUT`: No tickets available.
