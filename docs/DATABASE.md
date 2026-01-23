# Database Documentation

The application uses **PostgreSQL** as the primary database, managed via **Prisma ORM**.

## Core Models

### User Management
- **`User`**: The central entity for all users.
  - Roles: `AUDIENCE`, `ORGANIZER_UNVERIFIED`, `ORGANIZER_VERIFIED`, `ADMIN`.
  - Auth: Integration with NextAuth.js (`Account`, `Session`).
  - Profile: Includes fields for name, bio, interests, and admin-specific security fields.
- **`OrganizerProfile`**: Extended profile for users with organizer roles.
  - Linked one-to-one with `User`.
  - Includes venue details and approval status.
- **`OrganizerApproval`**: Tracks the approval process for organizer accounts.
  - Links `OrganizerProfile` with the `User` (Admin) who approved/rejected it.
  - Status: Recorded via `ApprovalStatus`.

### Content & Events
- **`Show`**: Represents a comedy event.
  - Contains details like title, venue, price, and date.
  - Linked to the creator (`User`) and performers (`Comedian`).
- **`Comedian`**: Profile for a performer.
  - Created by organizers.
  - Can be associated with multiple shows.
- **`ShowComedian`**: Join table managing the many-to-many relationship between `Show` and `Comedian`.
  - Includes metadata like performance order.

### Commerce
- **`Booking`**: Records a user's purchase for a show.
  - Statuses: `PENDING`, `CONFIRMED`, `CANCELLED`, etc.
  - Links `User` and `Show`.
- **`TicketInventory`**: Manages ticket availability and locking mechanisms to prevent overbooking.

## Enums

- **`UserRole`**: Defines permissions.
  - `AUDIENCE`: Standard user.
  - `ORGANIZER_UNVERIFIED`: Applied to be an organizer.
  - `ORGANIZER_VERIFIED`: Approved to create shows.
  - `ADMIN`: Platform administrator.
- **`BookingStatus`**: Tracks the lifecycle of a booking.
- **`ApprovalStatus`**: Tracks the state of organizer requests (`PENDING`, `APPROVED`, `REJECTED`).

## Relationships Diagram (Conceptual)

```mermaid
erDiagram
    User ||--o| OrganizerProfile : "has"
    User ||--o{ Show : "creates"
    User ||--o{ Booking : "makes"
    User ||--o{ OrganizerApproval : "approves"
    OrganizerProfile ||--o{ OrganizerApproval : "requests"
    Show ||--|{ ShowComedian : "features"
    Comedian ||--|{ ShowComedian : "performs in"
    Show ||--o{ Booking : "has"
    Show ||--o| TicketInventory : "manages"
```
