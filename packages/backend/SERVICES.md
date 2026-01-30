# Services Documentation

This document describes the service layer of the Comedy Connect backend, which contains all business logic, validation, and orchestration.

---

## 📖 Overview

The service layer is the **core business logic layer** of the application. Services:
- Validate input data
- Enforce business rules
- Orchestrate complex operations
- Delegate data access to repositories
- Throw domain errors (not HTTP responses)

**Services contain NO Prisma calls** - all data access is delegated to repositories.

---

## 📁 Directory Structure

```
packages/backend/services/
├── admin/
│   ├── admin-auth.service.ts       # Admin authentication
│   ├── admin-stats.service.ts      # System statistics
│   ├── admin-collections.service.ts # Financial collections
│   ├── admin-comedian.service.ts   # Comedian management
│   ├── admin-organizer.service.ts  # Organizer management
│   └── admin-fees.service.ts       # Platform fee configuration
├── user/
│   ├── profile.service.ts          # User profile operations
│   └── onboarding.service.ts       # User onboarding flow
├── comedians/
│   └── comedian.service.ts         # Comedian operations
├── organizers/
│   └── organizer.service.ts        # Organizer operations
├── shows/
│   └── show.service.ts             # Show management (existing)
└── bookings/
    └── booking.service.ts          # Booking operations (existing)
```

---

## 🔑 Service Conventions

### Singleton Pattern
All services export a singleton instance:

```typescript
class MyService {
    async doSomething() {
        // implementation
    }
}

export const myService = new MyService()
```

### Error Handling
Services throw **domain errors**, not HTTP responses:

```typescript
import { ValidationError, NotFoundError, UnauthorizedError } from '@/errors'

class MyService {
    async updateUser(userId: string, data: any) {
        if (!data.name) {
            throw new ValidationError('Name is required')
        }
        
        const user = await userRepository.findById(userId)
        if (!user) {
            throw new NotFoundError('User')
        }
        
        return userRepository.update(userId, data)
    }
}
```

### Repository Usage
Services MUST use repositories, never Prisma directly:

```typescript
// ❌ BAD - Direct Prisma call
async getUser(id: string) {
    return prisma.user.findUnique({ where: { id } })
}

// ✅ GOOD - Use repository
async getUser(id: string) {
    return userRepository.findById(id)
}
```

---

## 🛡️ Admin Services

### AdminAuthService
**File**: `services/admin/admin-auth.service.ts`

Handles admin authentication and password management.

#### Methods

##### `login(email: string, password: string)`
Authenticates an admin user.

**Validation**:
- Email must be whitelisted in `ADMIN_EMAIL` env var
- User must have `ADMIN` role
- Password must be set

**Returns**: `{ success: boolean, sessionCookie: string }`

**Throws**:
- `ValidationError` - If email/password missing or setup required
- `UnauthorizedError` - If authentication fails

---

##### `setup(email: string, password: string)`
One-time admin account setup.

**Validation**:
- Email must be whitelisted
- Password must be ≥8 characters

**Returns**: `{ success: boolean, sessionCookie: string }`

**Creates**: Admin user with hashed password

---

##### `setPassword(email: string, password: string, confirmPassword: string)`
Updates admin password (for authenticated admin).

**Validation**:
- Passwords must match
- Password must be ≥8 characters

**Returns**: `{ success: boolean }`

---

##### `resetPassword(email: string, password: string)`
Resets admin password.

**Validation**:
- Password must be ≥8 characters

**Returns**: `{ success: boolean }`

---

### AdminStatsService
**File**: `services/admin/admin-stats.service.ts`

Aggregates system-wide statistics for admin dashboard.

#### Methods

##### `getSystemStats()`
Retrieves comprehensive system metrics.

**Returns**:
```typescript
{
    metrics: {
        totalUsers: number
        newUsersToday: number
        activeShows: number
        totalRevenue: number
        pendingApprovals: number
    }
}
```

**Calculations**:
- `newUsersToday` - Users created in last 24 hours
- `activeShows` - Published shows with date ≥ now
- `totalRevenue` - Sum of all CONFIRMED/CONFIRMED_UNPAID booking amounts
- `pendingApprovals` - Comedians + Organizers with UNVERIFIED role (excluding rejected)

---

### AdminCollectionsService
**File**: `services/admin/admin-collections.service.ts`

Manages financial collections and disbursements.

#### Methods

##### `getCollectionsSummary(showId?: string)`
Retrieves collection data for shows.

**Parameters**:
- `showId` (optional) - Filter by specific show

**Returns**:
```typescript
{
    shows: Array<{
        id: string
        title: string
        grossRevenue: number
        platformFees: number
        platformFeePercent: number
        creatorPayout: number
        ticketsSold: number
        isDisbursed: boolean
    }>
}
```

**Calculations**:
- `grossRevenue` - Sum of all booking `totalAmount`
- `platformFees` - Sum of all booking `bookingFee`
- `creatorPayout` - `grossRevenue - platformFees`

---

##### `disburseShow(showId: string)`
Marks a show as disbursed.

**Validation**:
- `showId` required

**Returns**: `{ success: boolean, message: string }`

**Side Effects**: Sets `isDisbursed = true` on show

---

### AdminComedianService
**File**: `services/admin/admin-comedian.service.ts`

Manages comedian users and approvals.

#### Methods

##### `listComedianUsers()`
Lists all users with comedian roles.

**Returns**: `{ comedians: User[] }` (includes `comedianProfile`)

---

##### `getComedianProfiles()`
Lists all comedian profiles with fee information.

**Returns**: `{ comedians: ComedianProfile[] }` (includes `customPlatformFee`)

---

##### `updateCustomFee(comedianId: string, feePercent: number)`
Sets custom platform fee for a comedian.

**Validation**:
- `feePercent` must be 0-100

**Returns**: `{ success: boolean }`

**Side Effects**:
- Updates `comedianProfile.customPlatformFee`
- Updates `platformFeePercent` on all shows by this comedian

---

##### `approveComedian(comedianId: string)`
Approves a comedian application.

**Returns**: `{ success: boolean }`

**Side Effects**:
- Creates/updates `ComedianApproval` with status `APPROVED`
- Updates user role to `COMEDIAN`

---

##### `rejectComedian(comedianId: string, reason?: string)`
Rejects a comedian application.

**Returns**: `{ success: boolean }`

**Side Effects**: Creates/updates `ComedianApproval` with status `REJECTED`

---

##### `disableComedian(comedianId: string)`
Disables a comedian account.

**Returns**: `{ success: boolean }`

**Side Effects**: Sets role to `COMEDIAN_UNVERIFIED`

---

##### `enableComedian(comedianId: string)`
Re-enables a comedian account.

**Returns**: `{ success: boolean }`

**Side Effects**: Sets role to `COMEDIAN`

---

### AdminOrganizerService
**File**: `services/admin/admin-organizer.service.ts`

Manages organizer users and approvals. (Same methods as `AdminComedianService`)

---

### AdminFeesService
**File**: `services/admin/admin-fees.service.ts`

Manages platform fee configuration.

#### Methods

##### `getPlatformConfig()`
Retrieves platform configuration.

**Returns**: `{ config: PlatformConfig }`

**Creates default** if config doesn't exist (10% fee, empty slabs)

---

##### `updateFeeSlabs(slabs: any[])`
Updates platform fee slabs.

**Validation**:
- `slabs` must be an array

**Returns**: `{ success: boolean, config: PlatformConfig }`

---

## 👤 User/Profile Services

### ProfileService
**File**: `services/user/profile.service.ts`

Handles user profile operations.

#### Methods

##### `getOnboardingStatus(userId: string)`
Gets user's onboarding completion status.

**Returns**:
```typescript
{
    onboardingCompleted: boolean
    role: UserRole
}
```

**Throws**: `NotFoundError` if user doesn't exist

---

##### `updateProfile(userId: string, data: any)`
Updates user profile (basic info + creator profiles).

**Validation**:
- Max 1 YouTube URL
- Max 2 Instagram URLs

**Returns**: `{ success: boolean, message: string }`

**Side Effects**:
- Updates `User` basic fields (name, city, phone)
- Upserts `ComedianProfile` if comedian role
- Upserts `OrganizerProfile` if organizer role
- Creates approval requests for unverified creators

---

##### `deleteAccount(userId: string, userRole: string)`
Deletes a user account with cascade.

**Validation**:
- Admins cannot delete themselves
- Verified creators cannot have active published shows
- Cannot delete if shows have active bookings

**Returns**: `{ success: boolean, message: string }`

**Side Effects** (cascade delete via transaction):
1. All sessions
2. All bookings
3. All owned shows
4. Comedian/Organizer profiles
5. Approval records
6. User record

---

### OnboardingService
**File**: `services/user/onboarding.service.ts`

Handles user onboarding flow.

#### Methods

##### `completeOnboarding(userEmail: string, data: any)`
Completes user onboarding.

**Required Fields**:
- `name` (string)
- `age` (number, 1-120)
- `city` (string)
- `watchedComedy` ("yes" or "no")

**Optional Fields**: `phone`, `heardAboutUs`, `bio`

**Returns**:
```typescript
{
    success: boolean
    message: string
    user: { id, email, name, onboardingCompleted }
}
```

**Side Effects**: Sets `onboardingCompleted = true`

---

## 🎭 Creator Services

### ComedianService
**File**: `services/comedians/comedian.service.ts`

Handles comedian-specific operations.

#### Methods

##### `listComedians()`
Lists all comedian profiles.

**Returns**: `{ comedians: ComedianProfile[] }`

---

##### `getComedianById(id: string)`
Gets comedian by profile ID.

**Returns**: `{ comedian: ComedianProfile }`

---

##### `getComedianByUserId(userId: string)`
Gets comedian by user ID.

**Returns**: `{ comedian: ComedianProfile }`

---

##### `createComedianProfile(userId: string, data: any)`
Creates a comedian profile.

**Validation**:
- `name` (stage name) required

**Returns**: `{ comedian: ComedianProfile }`

---

##### `updateComedianProfile(userId: string, data: any)`
Updates comedian profile (creates if doesn't exist).

**Returns**: `{ comedian: ComedianProfile }`

---

### OrganizerService
**File**: `services/organizers/organizer.service.ts`

Handles organizer-specific operations.

#### Methods

##### `getOrganizerProfile(userId: string)`
Gets organizer profile.

**Returns**: `{ profile: OrganizerProfile }`

**Throws**: `NotFoundError` if profile doesn't exist

---

##### `createOrganizerProfile(userId: string, data: any)`
Creates organizer profile.

**Returns**: `{ profile: OrganizerProfile }`

---

##### `updateOrganizerProfile(userId: string, data: any)`
Updates organizer profile (creates if doesn't exist).

**Side Effects**: Also updates user name if provided

**Returns**: `{ profile: OrganizerProfile }`

---

## 🎫 Existing Services

### ShowService
**File**: `services/shows/show.service.ts`

*Already well-architected*. Handles show CRUD, publishing, inventory management.

See implementation for full details.

---

### BookingService
**File**: `services/bookings/booking.service.ts`

*Already well-architected*. Handles booking creation, payment, inventory checks.

See implementation for full details.

---

## 🧪 Testing Services

Services should be unit tested independently of routes and repositories:

```typescript
import { profileService } from '@/services/user/profile.service'
import { userRepository } from '@/repositories'

// Mock repository
jest.mock('@/repositories')

describe('ProfileService', () => {
    it('should throw NotFoundError if user not found', async () => {
        userRepository.findById.mockResolvedValue(null)
        
        await expect(
            profileService.getOnboardingStatus('123')
        ).rejects.toThrow(NotFoundError)
    })
})
```

---

## 📋 Service Checklist

When creating a new service:

- [ ] Export singleton instance
- [ ] Use repositories, never Prisma directly
- [ ] Throw domain errors (`ValidationError`, `NotFoundError`, etc.)
- [ ] Validate all inputs
- [ ] Document all methods with TSDoc comments
- [ ] Write unit tests
- [ ] Keep services focused (Single Responsibility Principle)

---

## 🔗 Related Documentation

- [API.md](file:///Users/samarthsaraswat/Codebases/comedy-connect/packages/backend/app/API.md) - API endpoint documentation
- [SYSTEM_DESIGN.md](file:///Users/samarthsaraswat/Codebases/comedy-connect/docs/SYSTEM_DESIGN.md) - System architecture overview
- [Repositories Index](file:///Users/samarthsaraswat/Codebases/comedy-connect/packages/backend/repositories/index.ts) - Available repositories

---

**Last Updated**: 2026-01-30 (Full refactoring completed)
