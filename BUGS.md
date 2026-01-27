# 🐛 Comedy Connect Bug Report

This document outlines all identified bugs in the Comedy Connect platform, excluding features related to Razorpay/Payment integration and postponed comedian features.

---

## 🔴 Priority: P0 (Mission Critical)

### 1. Admin Session Forgery (Security) - ✅ FIXED
- **Location**: `packages/backend/lib/admin-password.ts`
- **Impact**: Full administrative takeover.
- **Description**: The `admin-secure-session` cookie is a raw, un-signed JSON string. Any user can manually set this cookie in their browser to impersonate an admin and bypass the password check.
- **Fix**: Sign the cookie with a secret key or use a secure session store.

### 2. Hardcoded Mock Data in Shows API - ✅ FIXED
- **Location**: `packages/backend/app/api/v1/shows/route.ts`
- **Impact**: Users see fake shows ("Stand-Up Saturday Night", etc.) when no real data exists, causing confusion and a "broken" feel. It also appears in the "Show Management" dashboard.
- **Description**: The `GET` route for shows contains a large array of hardcoded `mockShows` and explicitly returns this data if the database query returns no results or encounters an error.
- **Fix**: Remove the `mockShows` array and the fallback logic. The API should return an empty array `[]` if no shows are found, allowing the frontend to display a proper "No shows found" or "Create your first show" empty state.

### 3. Show Date Timezone Mismatch & Missing Duration - ✅ FIXED
- **Location**: `packages/frontend/components/organizer/ShowManagement.tsx` (or Create Show Form) & `packages/frontend/app/shows/[id]/page.tsx`
- **Impact**: Shows appear at the wrong time (e.g., +5:30 offset double applied), leading to missed bookings. Users also lack critical "Show Duration" information.
- **Description**: 
    - **Timezone**: The date/time selected in the "Create Show" form is not reflected correctly on the public show page, shifting by +5:30 hours (likely a double GMT/IST conversion issue).
    - **Missing Duration**: There is currently no field to capture the duration of the show.
- **Fix**: 
    1. Fix the date handling logic to ensuring the selected local time is stored and retrieved consistently without double conversion.
    2. Add a new **mandatory** field "Show Duration (in hours and minutes)" to the Create Show form.
    3. Display the duration on the public show page.

---

## 🟠 Priority: P1 (High Impact)

### 1. Inventory Double-Decrement - ✅ FIXED
- **Location**: `packages/backend/services/bookings/booking.service.ts`
- **Impact**: Shows sell out incorrectly (ghost sales) when payments are integrated.
- **Description**: `createBooking` decrements `available` tickets in a transaction. The `processPaymentSuccess` logic also decrements inventory manually, leading to a double count.
- **Fix**: Remove the secondary decrement in `processPaymentSuccess`.

### 2. Platform Fee Overwrite - ✅ FIXED
- **Location**: `packages/backend/services/bookings/booking.service.ts:L176`
- **Impact**: Inaccurate financial records in future payment flows.
- **Description**: In the payment success logic, the code hardcodes platform fee to 8% (`booking.totalAmount * 0.08`), ignoring any custom fees (e.g., 5% or 10%) calculated during the initial booking creation.
- **Fix**: Use the `platformFee` already stored on the `Booking` record.

### 3. Permissive RBAC Middleware - ✅ FIXED
- **Location**: `packages/backend/middleware.ts`
- **Impact**: Unauthorized access to organizer/comedian features.
- **Description**: Middleware for `/organizer` and `/comedian` routes only checks if the user is authenticated (`!token`), not if they have the required `ORGANIZER_VERIFIED` or `COMEDIAN_VERIFIED` roles.
- **Fix**: Add role-based checks to the middleware protecting these path patterns.

### 4. Hidden Booking Fees - ✅ FIXED
- **Location**: `packages/frontend/components/shows/ShowBooking.tsx` & `packages/backend/services/bookings/booking.service.ts`
- **Impact**: User is charged more than displayed (Booking Fee is hidden).
- **Description**: The backend calculates a booking fee based on slab configuration (e.g., 7-9%) which increases the final amount. However, the frontend `ShowBooking` component shows the total as `Ticket Price * Quantity`, completely hiding the additional fee until the payment is processed/confirmed.
- **Fix**: Fetch the booking fee configuration in the frontend and display `Ticket Price + Booking Fee = Total` before confirmation.

### 5. Broken & Non-Mandatory Onboarding Flow - ✅ FIXED
- **Location**: `packages/backend/middleware.ts` & `packages/frontend/app/onboarding/page.tsx`
- **Impact**: New users can bypass essential profile setup; inconsistent UX after form submission.
- **Description**: 
    - **Bypass**: The middleware contains an empty check for onboarding status, allowing authenticated users to navigate the platform without completing their profile.
    - **Redirect Failure**: The onboarding form submission saves user data to the database but fails to consistently redirect the user to the homepage, leaving them stuck on the onboarding screen.
- **Fix**: 
    1. Implement a strict check in `middleware.ts` that redirects users with `onboardingCompleted: false` to `/onboarding`.
    2. Ensure the frontend `handleSubmit` in `onboarding/page.tsx` correctly handles a successful API response and performs a hard redirect or session refresh to clear the onboarding state.

### 6. Profile & Onboarding Form Inconsistency - ✅ FIXED
- **Location**: `packages/frontend/components/profile/ProfileEditForm.tsx` & `packages/frontend/app/onboarding/page.tsx`
- **Impact**: Inconsistent user data; poor UX when completing profiles; potential data saving errors.
- **Description**: 
    - **Validation Mismatch**: Fields like `age`, `phone`, and `city` are mandatory during onboarding but optional in the "Edit Profile" form.
    - **Type Mismatch**: The `city` field is a dropdown in onboarding but a text input in Edit Profile. Validations and field types must be synchronized.
    - **Missing Bio In Onboarding**: The onboarding form lacks the `Bio` field. It should be added as an optional field with the label "Bio (Publicly visible)" and placeholder "Tell us about yourself...".
    - **Incorrect "Complete Profile" Redirect**: Clicking "Complete Your Profile" on the profile page redirects to the initial onboarding flow instead of the more comprehensive "Edit Profile" view.
    - **Saving Bugs**: General inconsistencies in field handling are causing "Edit Profile" save operations to be unreliable.
- **Fix**: 
    1. Synchronize field types and `required` attributes between both forms.
    2. Add the optional `Bio` field to `onboarding/page.tsx`.
    3. Update the "Complete Your Profile" button in `ProfileCard.tsx` to redirect to `/profile/edit`.
    4. Ensure the `city` field uses the same selection logic/dropdown in both locations.

### 7. Organizer 'Manage Comedians' Functionality Removal - ✅ FIXED
- **Location**: `packages/frontend/app/organizer/page.tsx` & `packages/frontend/components/organizer/ComedianManagement.tsx` & `packages/backend/app/api/v1/organizer/comedians/route.ts`
- **Impact**: Unnecessary complexity and maintenance burden for unused feature.
- **Description**: The platform no longer requires organizers to manage comedians directly. This functionality should be removed from both the frontend (dashboard Quick Actions & specific pages) and the backend API.
- **Fix**: 
    1. Remove the "Manage Comedians" card from the Organizer Dashboard quick actions.
    2. Delete the `packages/frontend/app/organizer/comedians` route and directory.
    3. Delete the `packages/frontend/components/organizer/ComedianManagement.tsx` component.
    4. Delete the `packages/backend/app/api/v1/organizer/comedians` route and directory.
    5. **Caution**: Ensure no other parts of the system rely on these components before deletion.

### 8. Show Social Media Logic & Validation Failures -✅ FIXED but Requires Verification
- **Location**: `packages/frontend/components/organizer/ShowManagement.tsx` (Create Show Form)
- **Impact**: Poor data quality; organizers cannot intuitively add media links.
- **Description**:
    - **Broken "Add" Button**: Clicking the "Add" button for YouTube or Instagram links adds an empty entry to the list instead of the typed URL.
    - **Missing Limits**: There are no restrictions on the number of media links. (Requirement: Max 1 YouTube video, Max 2 Instagram reels).
    - **Missing Validation**: The fields accept any text. They should validate that YouTube links start with `https://youtube.com` and Instagram links with `https://instagram.com`.
    - **Implicit Submission**: If a user types a link but doesn't click "Add", the link is sometimes submitted automatically, which creates inconsistent behavior compared to the list-based approach.
- **Fix**:
    1. Fix the "Add" button handler to strictly take the input value, validate it, add it to the list, and then clear the input.
    2. Enforce limits (1 for YouTube, 2 for Instagram) and disable the "Add" button when reached.
    3. Implement client-side validation for the required URL prefixes.
    4. Ensure the form submission only includes links that have been explicitly added to the list (or handle the pending input clear logic).


---

## 🟡 Priority: P2 (Medium Impact)

### 1. Unsafe Capacity Reductions - ✅ FIXED
- **Location**: `packages/backend/services/shows/show.service.ts:L262`
- **Impact**: Overselling/Data corruption.
- **Description**: The update logic blocks capacity *increases* for published shows with bookings but fails to block capacity *decreases* below the number of tickets already sold.
- **Fix**: Add a check to ensure `newCapacity >= soldTickets`.

### 2. Navigation & Discovery Page Omissions (Frontend) - ✅ FIXED
- **Location**: `packages/frontend/components/layout/Navbar.tsx` & `packages/frontend/app/shows/page.tsx`
- **Impact**: Poor discoverability for organizers; inconvenient navigation for all users.
- **Description**: 
    - **Missing Home Tab**: The main navbar lacks a "Home" link, forcing users to click the logo or use the back button to return to the landing page.
    - **Missing 'List a Show' Action**: The `/shows` page is missing the "List a Show" functionality present on the homepage. This should be added to ensure consistency and ease of show creation for organizers/comedians.
- **Fix**: 
    1. Add a "Home" link to the `Navbar.tsx` navigation list.
    2. Implement the same "List a Show" button/action from the homepage into the `/shows/page.tsx` layout.

### 3. Missing Profile Completion Check for Registration - ✅ FIXED
- **Location**: `packages/frontend/app/onboarding/role-selection/page.tsx`
- **Impact**: Users can attempt to register for advanced roles (Organizer/Comedian) with incomplete base profiles, leading to data inconsistencies.
- **Description**: The role selection page allows users to click "Get Started" for Organizer or Comedian roles regardless of whether their basic profile information (from the initial onboarding) is complete.
- **Fix**: 
    1. Implement a check on the role selection page to verify if the user's basic profile is complete.
    2. If incomplete, show a popup/alert: "first complete the profile then only you can register as an organiser or a comedian".
    3. Redirect the user to the profile page upon closing the alert or clicking the button.

### 4. Admin Dashboard Pending Approvals Zero Count - ✅ FIXED
- **Location**: `packages/backend/app/api/v1/profile/update/route.ts` & `packages/backend/app/api/v1/admin/stats/route.ts`
- **Impact**: Admins are unaware of new pending requests, blocking platform growth.
- **Description**: The admin dashboard shows "Pending Approvals: 0" even when new organizers/comedians register. This happens because the profile update/creation logic creates the Profile record but *fails to create* the corresponding `OrganizerApproval` or `ComedianApproval` record in the database. The stats endpoint queries these missing Approval tables.
- **Fix**: Update the `profile/update` route to also create/upsert a `PENDING` record in the respective Approval table when a new Organizer or Comedian profile is created.

### 5. Missing Show Preview Functionality (Frontend) - ✅ FIXED
- **Location**: `packages/frontend/components/organizer/ShowManagement.tsx` (Draft/Show List)
- **Impact**: Creators cannot verify the final look of their show page or card before publishing, leading to potential errors and repeated edits.
- **Description**: There is currently no option to preview how a draft show will look to the audience (the full show details page) or how the poster will appear on the homepage card.
- **Fix**: 
    1. Add a "Preview" button to the show management card controls.
    2. Implement a preview modal that uses the shared `ShowDetail` component for 1:1 visual parity with the public page.
    3. Add layout adaptations (sticky banner, constrained scroll) for modal context.


---

## 🔵 Priority: P3 (Low Impact / UX)

### 1. Profile Deletion Side Effects - ✅ FIXED
- **Location**: `packages/backend/app/api/v1/profile/delete/route.ts`
- **Impact**: Unexpected data loss for other users.
- **Description**: Deleting an organizer account also deletes all their shows and **all bookings** for those shows, leaving audience members without records of their purchase.
- **Requirement**: If an organizer or comedian deletes their profile, their booked shows or Completed (but to be disbursed) shows must NOT be deleted from the database and records.
- **Fix**: Implement a "soft-delete" mechanism or strict dependency check that prevents deletion if active/booked/unsettled shows exist.

### 2. Non-Atomic Inventory Release - ✅ FIXED
- **Location**: `packages/backend/services/bookings/booking.service.ts:L277`
- **Impact**: Potential race condition in ticket availability.
- **Description**: Releasing tickets on payment failure uses a read-then-write approach instead of a Prisma atomic `increment`.
- **Fix**: Use `prisma.ticketInventory.update({ data: { available: { increment: quantity } } })`.

### 3. Admin Logout Redirect Fail - ✅ FIXED
- **Location**: `packages/backend/app/api/admin-secure/logout/route.ts`
- **Impact**: Admin sees an error page instead of being redirected to login/home after logout.
- **Description**: The logout endpoint uses `NextResponse.redirect` inside a `POST` handler, which defaults to HTTP 307 (Temporary Redirect). This preserves the `POST` method, causing the browser to try and `POST` to the login page (which fails). Additionally, the redirect is relative to the backend (port 4000), while the login page exists on the frontend (port 3000).
- **Fix**: Use HTTP 303 (See Other) for the redirect and ensure the URL points to the frontend domain/port.

### 4. Persistent 'Become an Organizer' Button (Frontend) - ✅ FIXED
- **Location**: `packages/frontend/components/profile/ProfileCard.tsx`
- **Impact**: Poor UX; users are encouraged to register as organizers even if they don't want to.
- **Description**: After a user completes their basic profile, a "Become an Organizer" button appears. Per requirements, this option should not be presented automatically on the profile page once the profile is complete, to avoid clutter and unwanted role promotion.
- **Fix**: Remove or hide the "Become an Organizer" button from the `ProfileCard` component for users who have completed their profile, or implement a more specific toggle/preference for this role.

### 5. Non-Mandatory Contact Fields in Registration (Frontend) - ✅ FIXED
- **Location**: `packages/frontend/app/onboarding/organizer/page.tsx` & `packages/frontend/app/onboarding/comedian/page.tsx`
- **Impact**: Incomplete professional profiles for admin verification.
- **Description**: The registration forms for both Organizers and Comedians include a "Contact Number" field, but it is currently optional. For verification purposes, providing a contact number should be mandatory.
- **Fix**: Add the `required` attribute to the "Contact Number" input fields in both registration forms and ensure proper validation.

### 6. Show Poster UI Inconsistency (Frontend) - ✅ FIXED
- **Location**: `packages/frontend/components/organizer/ShowManagement.tsx` vs `packages/frontend/components/shows/ShowDiscovery.tsx`
- **Impact**: Organizers see a different representation of their show than what the audience sees, leading to a disconnected experience and poor preview capability.
- **Description**: The show card/preview in the Organizer Dashboard ("Show Management" tab) uses a different layout, frame, and styling compared to the public-facing "Audience View" on the shows listing page.
- **Fix**: Update the Organizer's `ShowManagement` component to use the same `ShowCard` component (or a variant with edit controls) as the `ShowDiscovery` page to ensure visual consistency.

### 7. Ticket Sales Report Missing Columns & Actions Removal - ✅ FIXED
- **Location**: `packages/frontend/app/comedian/sales/page.tsx` & `packages/frontend/app/organizer/sales/page.tsx`
- **Impact**: Incomplete financial transparency for creators; "Actions" column is redundant.
- **Description**: 
    - **Missing Columns**: The Ticket Sales Report table lacks columns for "Platform Fee", "Earnings" (Net Revenue), and "Payment Status".
    - **Payment Status**: Needs to indicate if the funds are "To Be Disbursed" or "Disbursed".
    - **Dynamic Fees**: The report must reflect the actual platform fee charged per transaction/show, ensuring accuracy even if fee structures change.
    - **Redundant Actions**: The "Actions" column/tab is unnecessary and should be removed.
- **Fix**: 
    1. Add "Platform Fee", "Earnings", and "Payment Status" columns to the sales report table.
    2. Populate "Payment Status" based on the show's disbursement status.
    3. Remove the "Actions" column from the table.

---

## 🟢 Priority: P4 (Low Priority / Polish)

### 1. Inconsistent Phone Number Validation & Formatting (Frontend) - ✅ FIXED
- **Location**: `packages/frontend/app/onboarding/page.tsx`, `packages/frontend/components/profile/ProfileEditForm.tsx`, and other phone input locations.
- **Impact**: Poor UX and inconsistent data in the database.
- **Description**: Phone number fields lack strict validation. They should be restricted to exactly 10 digits and have a static `+91` prefix displayed in the UI to guide the user.
- **Fix**:
    1. Implement 10-digit numeric validation for all phone inputs.
    2. Add a static `+91` prefix (e.g., as an input group or label) next to the phone number fields.

### 2. Unknown Artist in Collections Console (Frontend) - ✅ FIXED
- **Location**: `packages/frontend/components/admin/CollectionManagement.tsx`
- **Impact**: Incomplete financial reporting; admins cannot easily identify the creator ofshows posted by comedians.
- **Description**: In the Collections Console, the "Show / Artist" column displays "By Unknown" for shows created by Comedians. This is because the frontend currently only checks for `organizerProfile.name`, ignoring `comedianProfile`.
- **Fix**: Update the display logic to fallback to `comedianProfile.stageName` or `user.name` if `organizerProfile` is missing.

### 3. Google Maps Link Validation (Frontend) - ✅ FIXED
- **Location**: `packages/frontend/components/organizer/ShowManagement.tsx` (Create Show Form)
- **Impact**: Invalid maps links prevent users from finding the venue.
- **Description**: The "Google Maps Link" field accepts any text. It should be restricted to valid Google Maps short links to ensure consistency and usability.
- **Fix**: Add client-side validation using regex to ensure the input starts with `https://maps.app.goo.gl`.
