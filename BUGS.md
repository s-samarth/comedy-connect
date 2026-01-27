# 🐛 Comedy Connect Bug Report

This document outlines all identified bugs in the Comedy Connect platform, excluding features related to Razorpay/Payment integration and postponed comedian features.

---

## How to Lodge a Bug

To ensure bugs are resolved efficiently, please follow this format when adding to this document:

### Format
```markdown
### [Bug Title] - [Status]
- **Location**: [File Path or Component]
- **Impact**: [Brief description of user impact]
- **Description**: [Detailed explanation of the issue]
- **Fix**: [Proposed or implemented solution]
```

### 🏷️ Status Definitions
- **OPEN**: Pending investigation or fix.
- **IN PROGRESS**: Currently being worked on.
- **VERIFY**: Fix implemented, pending verification.
- **FIXED**: Verified and resolved.
- **WONTFIX**: Intended behavior or valid limitation.

### 🚨 Priority Levels

| Priority | Level | Description | SLA |
| :--- | :--- | :--- | :--- |
| **P0** | **Critical** | System down, data loss, security breach. Blocks all work. | Immediate |
| **P1** | **High** | Major feature broken, no workaround. Blocks release. | 24 Hours |
| **P2** | **Medium** | Core functionality impaired but potential workaround exists. | 3 Days |
| **P3** | **Low** | Minor glitch, poor UX, or edge case. | Next Sprint |
| **P4** | **Cosmetic** | Typo, spacing, color mismatch. Non-functional. | Backlog |

---

## 🔴 Priority: P0 (Mission Critical)

No bugs found.
---

## 🟠 Priority: P1 (High Impact)

### 1. Broken & Non-Mandatory Onboarding Flow
- **Status**: OPEN
- **Location**: `packages/backend/middleware.ts` & `packages/frontend/app/onboarding/page.tsx`
- **Impact**: New users can bypass essential profile setup; inconsistent UX after form submission.
- **Description**: 
    - **Bypass**: The middleware contains an empty check for onboarding status, allowing authenticated users to navigate the platform without completing their profile.
    - **Redirect Failure**: The onboarding form submission saves user data to the database but fails to consistently redirect the user to the homepage, leaving them stuck on the onboarding screen.
- **Fix**: 
    1. Implement a strict check in `middleware.ts` that redirects users with `onboardingCompleted: false` to `/onboarding`.
    2. Ensure the frontend `handleSubmit` in `onboarding/page.tsx` correctly handles a successful API response and performs a hard redirect or session refresh to clear the onboarding state.

### 2. Profile & Onboarding Form Inconsistency
- **Status**: OPEN
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

---

## 🟡 Priority: P2 (Medium Impact)

### 1. Unsafe Capacity Reductions
- **Status**: OPEN
- **Location**: `packages/backend/services/shows/show.service.ts:L262`
- **Impact**: Overselling/Data corruption.
- **Description**: The update logic blocks capacity *increases* for published shows with bookings but fails to block capacity *decreases* below the number of tickets already sold.
- **Fix**: Add a check to ensure `newCapacity >= soldTickets`.

### 2. Navigation & Discovery Page Omissions (Frontend)
- **Status**: OPEN
- **Location**: `packages/frontend/components/layout/Navbar.tsx` & `packages/frontend/app/shows/page.tsx`
- **Impact**: Poor discoverability for organizers; inconvenient navigation for all users.
- **Description**: 
    - **Missing Home Tab**: The main navbar lacks a "Home" link, forcing users to click the logo or use the back button to return to the landing page.
    - **Missing 'List a Show' Action**: The `/shows` page is missing the "List a Show" functionality present on the homepage. This should be added to ensure consistency and ease of show creation for organizers/comedians.
- **Fix**: 
    1. Add a "Home" link to the `Navbar.tsx` navigation list.
    2. Implement the same "List a Show" button/action from the homepage into the `/shows/page.tsx` layout.

---

## 🔵 Priority: P3 (Low Impact / UX)

### 1. Profile Deletion Side Effects
- **Status**: OPEN
- **Location**: `packages/backend/app/api/v1/profile/delete/route.ts`
- **Impact**: Unexpected data loss for other users.
- **Description**: Deleting an organizer account also deletes all their shows and **all bookings** for those shows, leaving audience members without records of their purchase.
- **Requirement**: If an organizer or comedian deletes their profile, their booked shows or Completed (but to be disbursed) shows must NOT be deleted from the database and records.
- **Fix**: Implement a "soft-delete" mechanism or strict dependency check that prevents deletion if active/booked/unsettled shows exist.

### 2. Show Poster UI Inconsistency (Frontend)
- **Status**: OPEN
- **Location**: `packages/frontend/components/organizer/ShowManagement.tsx` vs `packages/frontend/components/shows/ShowDiscovery.tsx`
- **Impact**: Organizers see a different representation of their show than what the audience sees, leading to a disconnected experience and poor preview capability.
- **Description**: The show card/preview in the Organizer Dashboard ("Show Management" tab) uses a different layout, frame, and styling compared to the public-facing "Audience View" on the shows listing page.
- **Fix**: Update the Organizer's `ShowManagement` component to use the same `ShowCard` component (or a variant with edit controls) as the `ShowDiscovery` page to ensure visual consistency.

---

## 🟢 Priority: P4 (Low Priority / Polish)

No bugs found.