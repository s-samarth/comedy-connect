# Admin User Profile & User Flow

## User Profile: The Administrator
**Role:** Platform Super User / Administrator
**Persona:** "The Guardian"
**Goal:** Maintain platform integrity, ensure high-quality content, verify legitimate users, and manage platform economics.

---

## 🛡️ Admin Security Model

In the decoupled architecture, admin security is enforced at the **Backend** but presented at the **Frontend**.

### 1. Secure Access Flow (Dual-Layer)
**Goal:** Prevent unauthorized access to sensitive financial and moderation tools.

1. **Role Check**: 
   - User navigates to `/admin`.
   - Frontend calls `${BACKEND_URL}/api/v1/auth/session` via `useAuth()`.
   - If `role !== 'ADMIN'`, user is redirected away.
2. **Password Gate**:
   - Accessing sensitive tabs (Collections, Fees) triggers the **Admin Password Prompt**.
   - Admin enters the secondary password.
   - Frontend POSTs to `/api/v1/admin-secure/login`.
   - Backend verifies hash and sets a secure `admin-secure-session` cookie.
3. **Success**: Secure cookie is automatically included in subsequent fetch requests to `/api/v1/admin/*` endpoints.

---

## 🔄 Core Admin Workflows

### 2. User Approval Flow (Organizers/Comedians)
**Goal:** Verify identity and grant publishing rights.
1. **Trigger**: Admin sees "Pending Approvals" on the dashboard.
2. **Action**: Review user bio and social links.
3. **Decision**: Submit Approval/Rejection.
   - CALL: `POST /api/v1/admin/comedian-users` or `/api/v1/admin/organizers`.
4. **Result**: 
   - **Approved**: User receives permissions to create and publish shows.
   - **Rejected**: User must update their profile to be reconsidered. Once updated, they reappear in "Pending Approvals" with a "Pending" or "Pending Review" status.

### 3. Financial Oversight Flow
**Goal:** Monitor revenue and disburse funds to creators.
1. **Trigger**: Show completion.
2. **Action**: Review revenue breakdown and calculated platform fees in "Collections".
3. **Decision**: Click "Disburse".
   - CALL: `POST /api/v1/admin/collections` with `action: DISBURSE`.
4. **Result**: Show is marked as disbursed; financial records are updated.

### 4. Content Moderation
**Goal:** Maintain a safe platform environment.
1. **Action**: Search for any show using the Admin Shows view.
2. **Moderation**: Ability to disable or delete offensive content instantly.
   - CALL: `POST /api/v1/admin/shows/:id/disable`.
