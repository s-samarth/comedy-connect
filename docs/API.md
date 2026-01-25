# API Documentation (v1)

This document describes the REST API endpoints provided by the **Comedy Connect Backend Service**. 

## 🌐 Base URL
- **Local**: `http://localhost:4000/api/v1`
- **Production**: `https://api.comedyconnect.com/api/v1`

---

## 🔐 Authentication (`/auth`)

### `GET /auth/session`
Returns the current active session.
- **Response**: `SessionResponse` (from `@comedy-connect/types`)
- **Note**: Supports both NextAuth and Admin Secure cookies.

### `GET /auth/me`
Retrieves detailed profile info for the authenticated user.
- **Auth Required**: Yes

### `POST /auth/signin`
Initiates the OAuth sign-in flow (Google).

---

## 🎭 Shows (`/shows`)

### `GET /shows`
Lists all public shows (discovery mode) or shows belonging to the user (manage mode).
- **Query Params**:
  - `mode`: `discovery` (default) or `manage`.
- **Response**: `ShowResponse[]`

### `POST /shows`
Creates a new show.
- **Auth Required**: Yes (`ORGANIZER_VERIFIED`, `COMEDIAN_VERIFIED`, or `ADMIN`).
- **Body**: `CreateShowRequest`

### `GET /shows/:id`
Retrieves details for a specific show.

### `PUT /shows/:id`
Updates show details.
- **Auth Required**: Yes (Owner or Admin).

### `POST /shows/:id/publish`
Publishes a draft show.
- **Auth Required**: Yes (Owner).

---

## 🎟️ Bookings (`/bookings`)

### `POST /bookings`
Creates a new ticket booking.
- **Auth Required**: Yes
- **Body**: `CreateBookingRequest`
- **Logic**: Performs atomic inventory update and fee calculation.

### `GET /bookings`
Lists all bookings for the authenticated user.

---

## 🎤 Comedians (`/comedians`)

### `GET /comedians`
Lists comedian profiles.

### `POST /comedians`
Creates a new comedian profile.
- **Auth Required**: Yes (`ORGANIZER_VERIFIED`).

---

## 🛠️ Admin (`/admin`)

> [!IMPORTANT]
> All admin endpoints require the `ADMIN` role.

### `GET /admin/stats`
Retrieves system-wide metrics (Revenue, Users, Active Shows).

### `GET /admin/collections`
Financial breakdown of show revenue and platform fees.

### `POST /admin/comedian-users`
Manage comedian verification applications.

---

## 🖼️ Uploads (`/upload`)

### `POST /upload/image`
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
