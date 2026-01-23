# API Documentation

## Authentication (`/api/auth`)

- **`GET /api/auth/signin`**
  - Renders the custom sign-in page.
- **`POST /api/auth/signout`**
  - Handles user sign-out.
- **`GET /api/auth/session`**
  - Retrieves the current user session.
- **`GET /api/auth/me`**
  - Retrieves detailed information about the currently authenticated user.
- **`POST /api/auth/check-user`**
  - Checks if a user with a given email already exists.

## Shows (`/api/shows`)

- **`GET /api/shows`**
  - Lists all available comedy shows.
  - Query Params: `date`, `venue`, `price`.
- **`POST /api/shows`**
  - Creates a new comedy show.
  - Role Required: `ORGANIZER_VERIFIED` or `COMEDIAN_VERIFIED`.
- **`GET /api/shows/[id]`**
  - Retrieves details for a specific show.
- **`PUT /api/shows/[id]`**
  - Updates an existing show.
  - Role Required: `ORGANIZER_VERIFIED` (Owner) or `ADMIN`.
- **`DELETE /api/shows/[id]`**
  - Deletes a show.
  - Role Required: `ORGANIZER_VERIFIED` (Owner) or `ADMIN`.

## Comedians (`/api/comedians`)

- **`GET /api/comedians`**
  - Lists comedians.
  - **Authenticated Users**: See all comedians.
  - **Organizers/Comedians**: See comedians they created + their own profile.
- **`POST /api/comedians`**
  - Creates a new comedian profile.
  - Role Required: `ORGANIZER_VERIFIED`.

## Organizer (`/api/organizer`)

- **`GET /api/organizer/profile`**
  - Retrieves the authenticated user's organizer profile.
- **`POST /api/organizer/profile`**
  - Creates or updates the organizer profile.
  - Helper: Sets user role to `ORGANIZER_UNVERIFIED` if not already set.

## Bookings (`/api/bookings`)

- **`POST /api/bookings`**
  - Creates a new booking for a show.
  - Currently supports direct booking without payment integration.
- **`GET /api/bookings`**
  - Lists all bookings for the authenticated user.

## Uploads (`/api/upload`)

- **`POST /api/upload`**
  - Uploads an image to Cloudinary.
  - Type: `show` or `comedian`.
  - Role Required: `ORGANIZER_VERIFIED`.

## Webhooks (`/api/webhooks`)

- **`POST /api/webhooks/razorpay`**
  - Handles Razorpay payment events (`payment.captured`, `payment.failed`).
  - Verifies signature and updates booking status/inventory.

## Admin (`/api/admin`)

> **Note:** These endpoints require `ADMIN` role.

### General Admin
- **`GET /api/admin/organizers`**
  - Lists all organizers involved in the platform.
- **`GET /api/admin/shows`**
  - Lists all shows, including those requiring moderation.
- **`GET /api/admin/comedians`**
  - Lists all comedians registered on the platform.
- **`POST /api/admin/shows/[id]/disable`**
  - Disables a show (moderation action).
- **`GET /api/admin/fees`**
  - Retrieves the current platform fee configuration.
- **`POST /api/admin/fees`**
  - Updates the platform fee configuration (slabs).

### Secure Admin (`/api/admin-secure`)
- **`POST /api/admin-secure/login`**
  - Secure login for administrative tasks (password-based).
- **`POST /api/admin-secure/logout`**
  - Secure logout for admin session.
- **`POST /api/admin-secure/setup`**
  - Initial setup for admin password.

## User & Onboarding (`/api/user`)

- **`POST /api/user/onboarding`**
  - Submits user details to complete the onboarding process.
- **`GET /api/user/onboarding-status`**
  - Checks if the user has completed onboarding.
