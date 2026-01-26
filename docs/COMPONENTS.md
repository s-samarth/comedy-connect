# Components & Architecture

In the decoupled architecture, the frontend is a **Pure UI Consumer** located in `packages/frontend`. It is built using **Next.js App Router** and communicates with the backend via a versioned REST API.

## 🏗️ Design Principles

1. **Pure UI**: The frontend contains zero database logic or Prisma imports.
2. **Hook-Driven Data**: All data fetching and mutations are handled through custom hooks in `lib/hooks/`.
3. **Decoupled State**: Managed via SWR for server-state caching and revalidation.
4. **Dual-Mode Client**: Supports switching between the local monolith API and the standalone backend service.

---

## 📁 Directory Structure (`packages/frontend`)

### `app/`
Contains the application routes and pages.
- `(public)/`: Guest-accessible pages (Landing, Shows).
- `(auth)/`: Authentication pages.
- `admin/`: Admin-specific dashboards.
- `organizer/`: Organizer tools.
- `bookings/`: User booking history.

### `components/`
Modular React components organized by feature.

#### `components/layout/`
- **`Navbar`**: Global navigation header. Uses `useAuth()` hook for dynamic auth state.

#### `components/shows/`
- **`ShowDiscovery`**: Uses `useShows()` for lazy-loading and filtering comedy events.
- **`ShowBooking`**: Handles the booking flow using `api.post()`.

#### `components/organizer/`
- **`ShowManagement`**: Main dashboard for creating and editing shows.
- **`ShowPreviewModal`**: Previews the show details and card before publishing.

#### `components/admin/`
- **`AdminDashboard`**: Displays system metrics fetched via `useAdminStats()`.
- **`CollectionManagement`**: Financial oversight for admin users.

### `lib/`
- **`api/client.ts`**: The core `api` singleton with dual-mode support.
- **`hooks/index.ts`**: Centralized data-fetching hooks (SWR).

---

## 🔄 Data Flow Pattern

### Data Fetching (Read)
```typescript
// Example: Using the useShows hook
const { shows, isLoading } = useShows('discovery');
```

### Data Mutation (Write)
```typescript
// Example: Creating a booking
const result = await api.post('/api/v1/bookings', { showId, quantity });
```

---

## 🎨 Styling & UI
- **Tailwind CSS**: Utility-first styling for consistency.
- **Responsive**: Mobile-first design for audience browsing.
- **Micro-animations**: Subtle feedback for button clicks and loading states.
