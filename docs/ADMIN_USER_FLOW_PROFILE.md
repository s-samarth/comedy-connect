# Admin User Profile & User Flow

## User Profile: The Administrator
**Role:** Platform Super User / Administrator
**Persona:** "The Guardian"
**Goal:** Maintain platform integrity, ensure high-quality content, verify legitimate users, and manage platform economics.
**Key Responsibilities:**
- verifying Organizers and Comedians.
- Moderating Shows (content safety).
- Managing Platform Fees.
- Monitoring Security Logs.

### Needs
- **Efficiency:** Quick way to view pending approvals without navigating through clutter.
- **Clarity:** Clear indicators of user status (Verified/Unverified/Pending).
- **Control:** Ability to override, ban, or modify any resource instantly.
- **Insight:** High-level view of platform activity (new signups, revenue).

### Pain Points
- **Spam:** Floods of fake accounts.
- **Blind Spots:** Not knowing who is doing what on the platform.
- **Tedium:** Manual repetitive approval tasks.

---

## Admin User Flows

### 1. Secure Access Flow
**Goal:** Securely access the admin dashboard.
1. **Trigger:** User navigates to `/admin-secure` (HIDDEN URL).
2. **Step 1:** System checks for basic authentication (NextAuth). If not logged in -> Redirect to Sign In.
3. **Step 2:** System checks for `ADMIN` role. If not -> Redirect to Home (403).
4. **Step 3:** System presents "Secondary Password Information" (if not recently verified).
   - User enters Secondary Admin Password.
5. **Success:** User lands on **Admin Dashboard**.

### 2. User Approval Flow (Organizers/Comedians)
**Goal:** Verify a new user request.
1. **Trigger:** Admin sees "Pending Approvals" count on Dashboard.
2. **Step 1:** Click on "Organizers" or "Comedians" management card.
3. **Step 2:** View list filtered by `Pending`.
4. **Step 3:** Review User Details (Bio, Links, Contact).
   - *Micro-interaction:* Click external links (Instagram/YouTube) to verify identity.
5. **Step 4:** Decision.
   - **Approve:** Click "Approve". User role updates to `_VERIFIED`. Email notification sent (mock).
   - **Reject:** Click "Reject". User role remains `_UNVERIFIED` (or flagged).
6. **Feedback:** Toast notification "User Approved successfully". List refreshes.

### 3. Content Moderation Flow
**Goal:** Remove an inappropriate show.
1. **Trigger:** Report received or proactive check.
2. **Step 1:** Navigate to "Shows" management.
3. **Step 2:** Search/Filter for specific show.
4. **Step 3:** Review Show details (Title, Poster, Description).
5. **Step 4:** Click "Disable/Take Down".
6. **Result:** Show `isPublished` set to `false` (or deleted).

### 4. Platform Configuration Flow
**Goal:** Update booking fees.
1. **Trigger:** Business decision to change rates.
2. **Step 1:** Navigate to "Platform Settings" (Fees).
3. **Step 2:** Edit standard fee percentage or fixed fee.
4. **Step 3:** Save changes.
5. **Result:** New bookings generated after this point use the new fee structure.

### 5. Insight & Monitoring Flow
**Goal:** Check platform health.
1. **Trigger:** Daily check-in.
2. **Step 1:** View Dashboard.
3. **Step 2:** Check "New Users Today", "Active Shows", "Revenue This Month".
4. **Step 3:** (Optional) Check "Audit Logs" for recent admin actions.

### 6. Financial Operations Flow
**Goal:** Disburse earnings to show creators.
1. **Trigger:** Show completed and revenue confirmed.
2. **Step 1:** Navigate to "Collections" tab.
3. **Step 2:** Filter by "Booked" or "Active".
4. **Step 3:** Review show earnings and platform fees.
5. **Step 4:** Click "Disburse".
6. **Result:** Show marked as `isDisbursed`, earnings considered paid out.
