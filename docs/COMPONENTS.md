# Components & Architecture

The frontend is built using **Next.js App Router** with a component-based architecture.

## Directory Structure

### `app/`
Contains the application routes and pages.
- `page.tsx`: Landing page.
- `error.tsx` / `loading.tsx`: Global error and loading boundaries.
- `layout.tsx`: Root layout including providers.

### `components/`
Reusable UI components organized by feature.

#### `components/layout/`
Application-wide layout elements.
- **`Navbar`**: Global navigation header with dynamic authentication states and dashboards links.

#### `components/ui/`
Shared utility components.
- **`ImageUpload`**: Cloudinary image upload widget.
- **`PaymentComingSoon`**: Placeholder for payment integration.

#### `components/shows/`
Components for show discovery and booking.
- **`ShowDiscovery`**: Main interface for browsing and filtering shows.
- **`ShowBooking`**: Handles the ticket booking flow.

#### `components/admin/`
Administrative tools and dashboards.
- **`AdminPasswordPrompt`**: Security gate for sensitive actions.
- **`AdminPasswordReset`**: Admin password management.
- **`ShowManagement`**: Admin-level show moderation.
- **`OrganizerManagement`**: Approval workflow for organizers.
- **`FeeManagement`**: Platform fee configuration.
- **`DatabaseCleanup`**: Maintenance utilities.

#### `components/organizer/`
Organizer-specific dashboards.
- **`ProfileForm`**: Organizer profile management.
- **`ShowManagement`**: Interface for organizers to create/edit shows.
- **`ComedianManagement`**: Interface for managing comedian profiles.

#### `components/profile/`
User profile features.
- **`ProfileCard`**: Displays user info (integrated with Auth).
- **`UserBookings`**: List of user's past and upcoming bookings.

#### `components/providers/`
React Context providers wrapping the application.
- **`AuthProvider`**: Wraps the app in `SessionProvider` for NextAuth.

## Key Design Constraints
- **Client vs Server Components**:
  - Pages are Server Components by default.
  - Interactive components (modals, forms) must use `"use client"`.
- **Styling**: All styling is done via Tailwind CSS utility classes.
