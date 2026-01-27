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
No bugs found.

---

## 🟡 Priority: P2 (Medium Impact)

### 1. Unsafe Capacity Reductions
- **Status**: OPEN
- **Location**: `packages/backend/services/shows/show.service.ts:L262`
- **Impact**: Overselling/Data corruption.
- **Description**: The update logic blocks capacity *increases* for published shows with bookings but fails to block capacity *decreases* below the number of tickets already sold.
- **Fix**: Add a check to ensure `newCapacity >= soldTickets`.

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

---