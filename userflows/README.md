# User Flows

This directory contains visual representations of the core user journeys within the Comedy Connect application. This document details each flow to assist in development and system design.

## 1. Audience User Flow
**File:** `User Flow Audience.png`

The Audience flow covers the experience of a general user looking to browse and book comedy shows.

### Key Stages:
1.  **Landing & Browsing**:
    *   User arrives at the homepage.
    *   Can view a list of available shows without logging in.
    *   Can click on a show to view details.
2.  **Authentication**:
    *   User can choose to log in via Google.
    *   **New User Handling**: If it's a first-time login, the user is prompted to complete a basic profile (Name, Email). These details are stored in the database to prevent future prompts.
3.  **Booking Process**:
    *   User selects a show and the number of tickets.
    *   **Login Check**: The system validates if the user is logged in before proceeding to checkout. If not, they are redirected to login.
    *   **Seamless Return**: After successful authentication, the user is automatically returned to the exact show page they were viewing, maintaining their booking context.
4.  **Payment & Confirmation**:
    *   User proceeds to payment.
    *   Upon success:
        *   Transaction is recorded in the database.
        *   Ticket inventory is updated.
        *   Booking is added to the user's "My Bookings" section.
    *   User is redirected to the homepage and can verify their ticket in the "My Bookings" tab.

---

## 2. Onboarding Flow (Unverified Comedian & Organizer)
**File:** `User Flow Unverified Comedian and Unverified Organiser.png`

This flow describes how a standard user upgrades their account to a Creator role (Comedian or Organizer).

### Key Stages:
1.  **Initial Authentication**:
    *   Standard login and profile creation (same as Audience).
2.  **Role Selection**:
    *   User encounters an option/prompt to register as a **Comedian** or an **Organizer**.
3.  **Profile Submission**:
    *   **Comedian Track**: User fills out a specific form (Stage Name, Bio, Social Links).
    *   **Organizer Track**: User fills out a specific form (Venue Name, Contact Details, Description).
4.  **Verification State**:
    *   Upon submission, the data is stored, and the user's role is set to `Unverified Comedian` or `Unverified Organizer`.
    *   The user is returned to the homepage.
5.  **Admin Approval**:
    *   The account remains in a "Pending" state until an Admin reviews and approves the profile.
    *   **Approved**: Role updates to `Verified Comedian` or `Verified Organizer`.
    *   **Rejected/Pending**: User retains limited access.

---

## 3. Creator Flow (Verified Comedian & Organizer)
**File:** `User Flow Verified Comedian and Verified Organiser.png`

This flow details the capabilities available to users who have successfully passed the verification process.

### Key Stages:
1.  **Dashboard Access**:
    *   Verified users log in and access a dedicated "Organiser/Comedian Dashboard".
    *   Dashboard provides an overview of active shows, past shows, and other management features.
2.  **Show Creation**:
    *   User clicks "List a Show" and completes a detailed form (Title, Date, Venue, Price, etc.).
3.  **Draft vs. Publish**:
    *   **Save as Draft**: Show is saved internally. It is **not** visible to the public. The user can continue to edit or delete it.
    *   **Publish**:
        *   The show becomes live and visible to the Audience in discovery views.
        *   **Privacy Guard**: Until published, shows are strictly hidden from public discovery and filtering, accessible only to the creator via their dashboard.
        *   *Note: usage implies published shows may have restricted editing capabilities to protect sold tickets.*
4.  **Completion**:
    *   User is redirected back to the dashboard, viewing the new show in their active list.
