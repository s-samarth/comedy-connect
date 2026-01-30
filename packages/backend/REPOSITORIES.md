# Repositories Documentation

This document describes the repository layer of the Comedy Connect backend, which handles all database operations.

---

## 📖 Overview

The repository layer is the **data access layer** of the application. Repositories:
- Encapsulate all Prisma database calls
- Provide clean interfaces for data operations
- Have NO business logic
- Return raw database entities (no transformations)

**Repositories are the ONLY place where Prisma is called.**

---

## 📁 Available Repositories

### Core Repositories

| Repository | File | Entity | Methods |
|------------|------|--------|---------|
| **UserRepository** | `user.repository.ts` | User | 8 methods |
| **ShowRepository** | `show.repository.ts` | Show | 12+ methods |
| **BookingRepository** | `booking.repository.ts` | Booking | 8+ methods |
| **AdminRepository** | `admin.repository.ts` | Admin records | 4+ methods |

### Profile Repositories

| Repository | File | Entity | Methods |
|------------|------|--------|---------|
| **ComedianRepository** | `comedian.repository.ts` | ComedianProfile | 6 methods |
| **OrganizerRepository** | `organizer.repository.ts` | OrganizerProfile | 6 methods |
| **ApprovalRepository** | `approval.repository.ts` | Approvals | 6 methods |

### Configuration Repositories

| Repository | File | Entity | Methods |
|------------|------|--------|---------|
| **PlatformConfigRepository** | `platform-config.repository.ts` | PlatformConfig | 4 methods |

---

## 📚 Repository Reference

### UserRepository

**File**: `repositories/user.repository.ts`

#### Methods

```typescript
// Find operations
findById(id: string): Promise<User | null>
findByEmail(email: string): Promise<User | null>
findManyWithRole(role: string, where?: any): Promise<User[]>

// Update operations
updateProfile(userId: string, data: any): Promise<User>

// Count operations
count(where?: any): Promise<number>

// Delete operations
deleteWithTransaction(userId: string, tx: any): Promise<void>
```

#### Usage Example

```typescript
import { userRepository } from '@/repositories'

const user = await userRepository.findById('123')
const comedians = await userRepository.findManyWithRole('COMEDIAN')
const totalUsers = await userRepository.count()
```

---

### ComedianRepository

**File**: `repositories/comedian.repository.ts`

#### Methods

```typescript
findMany(where?: any): Promise<ComedianProfile[]>
findById(id: string): Promise<ComedianProfile | null>
findByUserId(userId: string): Promise<ComedianProfile | null>
create(data: any): Promise<ComedianProfile>
update(id: string, data: any): Promise<ComedianProfile>
upsert(userId: string, data: any): Promise<ComedianProfile>
```

#### Usage Example

```typescript
import { comedianRepository } from '@/repositories'

const comedian = await comedianRepository.findByUserId(userId)
const allComedians = await comedianRepository.findMany()
```

---

### OrganizerRepository

**File**: `repositories/organizer.repository.ts`

Same interface as `ComedianRepository` but for `OrganizerProfile` entity.

---

### ApprovalRepository

**File**: `repositories/approval.repository.ts`

#### Methods

```typescript
// Find operations
findComedianApproval(userId: string): Promise<ComedianApproval | null>
findOrganizerApproval(userId: string): Promise<OrganizerApproval | null>

// Upsert operations
upsertComedianApproval(userId: string, data: any): Promise<ComedianApproval>
upsertOrganizerApproval(userId: string, data: any): Promise<OrganizerApproval>

// Update operations
updateComedianApprovalStatus(userId: string, status: string): Promise<ComedianApproval>
updateOrganizerApprovalStatus(userId: string, status: string): Promise<OrganizerApproval>
```

#### Usage Example

```typescript
import { approvalRepository } from '@/repositories'

const approval = await approvalRepository.findComedianApproval(userId)
await approvalRepository.updateComedianApprovalStatus(userId, 'APPROVED')
```

---

### PlatformConfigRepository

**File**: `repositories/platform-config.repository.ts`

#### Methods

```typescript
get(): Promise<PlatformConfig | null>
create(data: any): Promise<PlatformConfig>
update(data: any): Promise<PlatformConfig>
upsert(data: any): Promise<PlatformConfig>
```

#### Usage Example

```typescript
import { platformConfigRepository } from '@/repositories'

let config = await platformConfigRepository.get()
if (!config) {
    config = await platformConfigRepository.create({
        platformFeePercent: 10,
        feeSlabs: []
    })
}
```

---

## 🎯 Repository Conventions

### 1. Pure Data Access

Repositories should ONLY interact with the database:

```typescript
// ✅ GOOD - Pure data access
async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
}

// ❌ BAD - Business logic in repository
async findById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
        throw new NotFoundError('User') // ❌ Error handling is business logic
    }
    return user
}
```

### 2. Return Raw Entities

```typescript
// ✅ GOOD - Return raw Prisma entity
async findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
}

// ❌ BAD - Transform data
async findById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } })
    return { // ❌ Transformation is business logic
        ...user,
        fullName: `${user.firstName} ${user.lastName}`
    }
}
```

### 3. Flexible Where Clauses

Accept `where` parameter for flexible querying:

```typescript
async findMany(where?: any) {
    return prisma.comedianProfile.findMany({ where })
}
```

### 4. Include Common Relationships

```typescript
async findByUserId(userId: string) {
    return prisma.comedianProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true
                }
            }
        }
    })
}
```

### 5. Singleton Pattern

Export a singleton instance:

```typescript
class UserRepository {
    async findById(id: string) {
        return prisma.user.findUnique({ where: { id } })
    }
}

export const userRepository = new UserRepository()
```

---

## 🔄 Transaction Support

For operations requiring transactions, accept a transaction object:

```typescript
class UserRepository {
    async deleteWithTransaction(userId: string, tx: any) {
        // Delete related records first
        await tx.session.deleteMany({ where: { userId } })
        await tx.booking.deleteMany({ where: { userId } })
        
        // Delete user
        await tx.user.delete({ where: { id: userId } })
    }
}

// Usage in service
await prisma.$transaction(async (tx) => {
    await userRepository.deleteWithTransaction(userId, tx)
})
```

---

## 📋 Repository Checklist

When creating a new repository:

- [ ] Export singleton instance
- [ ] Include all CRUD operations needed
- [ ] NO business logic (validation, transformations, etc.)
- [ ] Return raw Prisma entities
- [ ] Use TypeScript types from Prisma
- [ ] Support flexible `where` clauses
- [ ] Include common relationships in `findBy` methods
- [ ] Support transactions where needed (pass `tx` parameter)

---

## 🧪 Testing Repositories

Repositories should be tested with a real or mock database:

```typescript
import { userRepository } from './user.repository'
import { prisma } from '@/lib/prisma'

describe('UserRepository', () => {
    afterEach(async () => {
        await prisma.user.deleteMany()
    })

    it('should find user by id', async () => {
        const user = await prisma.user.create({
            data: { email: 'test@example.com', role: 'USER' }
        })

        const found = await userRepository.findById(user.id)
        expect(found).toBeDefined()
        expect(found?.email).toBe('test@example.com')
    })
})
```

---

## 🔗 Complete Index

All repositories are exported from `repositories/index.ts`:

```typescript
export * from "./show.repository"
export * from "./booking.repository"
export * from "./admin.repository"
export * from "./user.repository"
export * from "./comedian.repository"
export * from "./organizer.repository"
export * from "./approval.repository"
export * from "./platform-config.repository"
```

**Usage**:

```typescript
import { 
    userRepository, 
    comedianRepository, 
    showRepository 
} from '@/repositories'
```

---

## 🎓 Common Patterns

### Pattern 1: Find or Create

```typescript
async findOrCreate(email: string, data: any) {
    let user = await this.findByEmail(email)
    if (!user) {
        user = await prisma.user.create({ data })
    }
    return user
}
```

### Pattern 2: Upsert

```typescript
async upsert(userId: string, data: any) {
    return prisma.comedianProfile.upsert({
        where: { userId },
        create: { userId, ...data },
        update: data
    })
}
```

### Pattern 3: Cascade Delete

```typescript
async deleteWithCascade(userId: string) {
    await prisma.$transaction(async (tx) => {
        await tx.comedianProfile.deleteMany({ where: { userId } })
        await tx.organizerProfile.deleteMany({ where: { userId } })
        await tx.user.delete({ where: { id: userId } })
    })
}
```

### Pattern 4: Batch Operations

```typescript
async updateMany(ids: string[], data: any) {
    return prisma.user.updateMany({
        where: { id: { in: ids } },
        data
    })
}
```

---

## 📖 Related Documentation

- [SERVICES.md](file:///Users/samarthsaraswat/Codebases/comedy-connect/packages/backend/SERVICES.md) - Service layer documentation
- [API.md](file:///Users/samarthsaraswat/Codebases/comedy-connect/packages/backend/app/API.md) - API endpoint documentation
- [Prisma Schema](file:///Users/samarthsaraswat/Codebases/comedy-connect/packages/backend/prisma/schema.prisma) - Database schema

---

**Last Updated**: 2026-01-30 (Full refactoring completed)
