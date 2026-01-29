# Comedy Connect Frontend v2

A modern, premium frontend for the Comedy Connect platform, built with **Next.js 15+**, **Tailwind CSS 4**, and **Shadcn UI**.

## 🚀 Overview

This is the "Generation 2" frontend for Comedy Connect, designed with a **Dark Club Aesthetic** (Black/Orange palette) and a focus on high-fidelity "faces-first" discovery. It communicates with the existing backend via a proxy setup.

## 🛠️ Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS 4, Vanilla CSS variables
- **UI Components**: Shadcn UI (Radix Primitives)
- **Icons**: Lucide React
- **Data Fetching**: SWR (Stale-While-Revalidate)
- **Auth**: NextAuth.js (Session Integration with Backend)
- **Forms**: React Hook Form + Zod

## 🏗️ Architecture

### API & Authentication Proxy
To maintain compatibility with the existing backend cookies and session logic, this frontend uses **Next.js Rewrites**.

- **Config**: `next.config.ts` proxies requests starting with `/api` to the backend (default: `http://localhost:4000`).
- **Authentication**: Usage of `UseAuth` hook relies on the backend's session cookie.
- **Important**: The `Navbar` and auth flows use **relative paths** (e.g., `/api/auth/signin`) to ensure the browser sends cookies to the correct domain context (port 3000 -> proxied to 4000).

### Key Directories

- **`app/`**: Next.js App Router file system.
    - **`admin/`**: The Admin Panel (Client-side protected).
    - **`comedian/`**: Comedian Dashboard.
    - **`organizer/`**: Organizer Dashboard.
    - **`onboarding/`**: Role selection and profile creation.
- **`components/`**: Reusable UI components.
    - **`admin/`**: Ported management components (Organizers, Comedians, Shows, Fees).
    - **`ui/`**: Shadcn UI primitives.
- **`lib/`**: Utilities.
    - **`api/client.ts`**: Axios/Fetch wrapper for API calls.
    - **`hooks/`**: Custom hooks (`useAuth`, etc.).

## 🔑 Key Features

### Admin Panel (`/admin`)
A restricted area for platform administrators to:
- Approve/Verified Organizers.
- Manage Comedian profiles.
- Moderate Shows and Reviews.
- Configure Platform Fees.
- **Security**: Protected by both Session Role (`ADMIN`) and a secondary **Admin Password** prompt.

### Dashboards
- **Comedian**: Manage profiles, view upcoming shows.
- **Organizer**: Manage venues, publish shows, track bookings.

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- The `backend` package must be running on port 4000.

### Installation

```bash
cd packages/frontendv2
npm install
```

### Running Locally

1.  **Start the Backend** (in a simplified terminal):
    ```bash
    npm run dev --prefix packages/backend
    ```

2.  **Start Frontend v2**:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000).

## 🧪 Testing

### Authentication Testing
Because we proxy auth to the backend, `localhost:3000/api/auth/signin` should be used.
- **Comedian Flow**: Login -> Onboarding -> Comedian Dashboard.
- **Admin Flow**: Login (Admin Email) -> `/admin` -> Password Check -> Admin Dashboard.

## 📜 License
Private.
