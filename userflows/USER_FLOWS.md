# User Flow Documentation

This document outlines the comprehensive user flows for all roles in the Comedy Connect platform, based on the current implementation.

## 👥 User Roles

1.  **Audience (Guest/Signed In)**: Browse and book shows.
2.  **Organizer (Unverified/Verified)**: Create and manage shows.
3.  **Comedian (Unverified/Verified)**: Manage profile and be added to shows.
4.  **Admin**: Verify users, oversee platform, and manage finances.

---

## 1. Audience User Flow

### Scenario A: Discovery & Booking (Public User)
1.  **Landing**: User arrives at `http://localhost:3000/`.
2.  **Browse**: Scrolls through "Upcoming Shows" or clicks "Browse All Shows" (`/shows`).
3.  **Filtration**: Can filter shows by date or venue (if implemented on UI).
4.  **View Details**: Clicks on a show card to view `/shows/[id]`.
    *    Sees Description, Venue, Date, Ticket Price, and Comedian Lineup.
5.  **Booking**:
    *   Clicks "Book Tickets".
    *   **If Guest**: Authenticates via Google OAuth (`/auth/signin`) or continues as Guest (if enabled).
    *   **Select Quantity**: Chooses number of tickets.
    *   **Payment**: Redirects to Payment Gateway (Razorpay).
    *   **Success**: On successful payment, redirected to `/shows/[id]/success`. Ticket is confirmed.
    *   **Failure**: If payment fails, redirected back to show page or error page.

### Scenario B: User Dashboard
1.  **Profile**: Navigates to `/profile` (protected).
2.  **My Bookings**: Views list of past and upcoming bookings (`/bookings`).
3.  **Account Settings**: Updates name/bio (`/profile/edit`).

---

## 2. Organizer User Flow

### Scenario A: Onboarding
1.  **Sign Up**: logs in via Google.
2.  **Role Selection**: Redirected to `/onboarding`. Selects "I want to Organize Shows".
3.  **Profile Setup**: Fills details (Name, Bio, Social Links).
4.  **Verification Wait**:
    *   Dashboard (`/organizer`) shows "Pending Verification" banner.
    *   *Restriction*: Cannot create public shows.

### Scenario B: Show Management (Verified)
1.  **Dashboard**: Sees "Verified" status.
2.  **Create Show**:
    *   Clicks "Create Show".
    *   Fills: Title, Date, Venue, Price, Description, Banner Image.
    *   **Add Comedians**: Selects comedians from the platform or adds manually.
    *   **Submit**: Show created as DRAFT.
3.  **Publish Show**:
    *   Reviews draft details.
    *   Clicks "Publish" -> Show becomes visible on public `/shows`.
4.  **Manage Sales**:
    *   Views Dashboard (`/organizer/dashboard`).
    *   Sees Ticket Sales, Revenue, and Attendee List.

---

## 3. Comedian User Flow

### Scenario A: Onboarding
1.  **Sign Up**: Logs in via Google.
2.  **Role Selection**: Selects "I am a Comedian".
3.  **Profile Creation**:
    *   Uploads Headshot, adds Bio, YouTube/Instagram links.
    *   Submits for verification.
4.  **Status**: Dashboard (`/comedian`) shows verification status.

### Scenario B: Engagement
1.  **Profile Management**: Updates profile at `/comedian/profile`.
2.  **Show Invites**: (Future) Receives requests to perform.
3.  **Schedule**: Views shows they are booked for.

---

## 4. Admin User Flow

### Scenario A: Security
1.  **Access**: Navigates to `/admin-hidden`.
2.  **Auth**:
    *   Checks if email is in `ADMIN_WHITELIST` (Middleware).
    *   Prompts for specialized **Admin Password** (Double verification).
3.  **Session**: Sets secure admin cookie.

### Scenario B: Platform Management
1.  **Dashboard**: Navigates to `/admin`.
    *   **Stats**: Views Total Revenue, Active Users, Shows.
2.  **Approvals**:
    *   **Comedians**: Reviews pending comedian profiles -> Approve/Reject.
    *   **Organizers**: Reviews pending organizer profiles -> Approve/Reject.
3.  **Collections**:
    *   Views Financial Reports (`/admin/collections`).
    *   Tracks Platform Fees vs Organizer Payouts.
4.  **User Management**: Can ban/suspend users if necessary.

---

## 🚨 Edge Cases

1.  **Unverified Actions**: Unverified organizers trying to access `/api/shows` (POST) -> `403 Forbidden`.
2.  **Sold Out**: User tries to book show with 0 tickets -> Button disabled or API returns `SOLD_OUT`.
3.  **Concurrency**: Two users book last ticket simultaneously -> Database transaction ensures only one succeeds; loser gets error.
4.  **Session Expiry**: User session expires mid-flow -> Redirected to `/auth/signin` -> Returned to original page after login.
