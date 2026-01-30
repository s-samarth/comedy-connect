# Backend Developer Guidelines

> **Purpose**: This document defines the mandatory architectural patterns and best practices for Comedy Connect backend development. All code contributions MUST follow these guidelines to maintain system quality and consistency.

**Last Updated**: 2026-01-30 (Post-Architecture Refactoring)

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [The Three-Layer Rule](#the-three-layer-rule)
3. [Adding a New Feature: Complete Walkthrough](#adding-a-new-feature-complete-walkthrough)
4. [Layer 1: API Routes (Controllers)](#layer-1-api-routes-controllers)
5. [Layer 2: Services (Business Logic)](#layer-2-services-business-logic)
6. [Layer 3: Repositories (Data Access)](#layer-3-repositories-data-access)
7. [Error Handling](#error-handling)
8. [Testing Guidelines](#testing-guidelines)
9. [Code Review Checklist](#code-review-checklist)
10. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
11. [Common Scenarios](#common-scenarios)
12. [Migration from Legacy Code](#migration-from-legacy-code)

---

## Architecture Overview

### The Clean Architecture Principle

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │            API Routes (/app/api/v1)              │  │
│  │  • Authentication (JWT, sessions, cookies)       │  │
│  │  • Request parsing (JSON, query params)          │  │
│  │  • Response formatting (HTTP status, headers)    │  │
│  │  • Minimal logic (5-20 lines per handler)        │  │
│  └────────────────┬─────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────┘
                    │ delegates to
                    ▼
┌─────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Services (/services)                │  │
│  │  • Input validation (business rules)             │  │
│  │  • Business logic (calculations, workflows)      │  │
│  │  • Orchestration (coordinate multiple repos)     │  │
│  │  • Domain error throwing                         │  │
│  │  • NO Prisma calls, NO HTTP responses            │  │
│  └────────────────┬─────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────┘
                    │ uses
                    ▼
┌─────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Repositories (/repositories)           │  │
│  │  • Prisma queries (ONLY place for DB calls)      │  │
│  │  • Query building                                │  │
│  │  • Transaction management                        │  │
│  │  • Return raw entities                           │  │
│  │  • NO business logic, NO validation              │  │
│  └────────────────┬─────────────────────────────────┘  │
└───────────────────┼─────────────────────────────────────┘
                    │ uses
                    ▼
┌─────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                Prisma ORM                        │  │
│  │                PostgreSQL                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Principles (MANDATORY)

1. **Single Responsibility**: Each layer does ONE thing
2. **Dependency Direction**: Upper layers depend on lower layers, NEVER reverse
3. **No Layer Skipping**: Routes → Services → Repositories → Prisma (no shortcuts)
4. **Pure Functions**: Services and repositories should be testable in isolation
5. **Domain Errors**: Throw business errors, not HTTP responses

---

## The Three-Layer Rule

### Golden Rules (NEVER VIOLATE)

| ❌ FORBIDDEN | ✅ REQUIRED |
|-------------|------------|
| Prisma calls in routes | Routes delegate to services |
| Prisma calls in services | Services use repositories |
| Business logic in repositories | Repositories only query DB |
| HTTP responses in services | Services throw domain errors |
| Validation in routes | Validation in services |
| Data transformation in repositories | Repositories return raw entities |

---

## Adding a New Feature: Complete Walkthrough

### Scenario: Add "Report Show" Feature

Users should be able to report inappropriate shows.

### Step 1: Design the Data Model

```prisma
// prisma/schema.prisma
model ShowReport {
  id          String   @id @default(cuid())
  showId      String
  show        Show     @relation(fields: [showId], references: [id])
  reporterId  String
  reporter    User     @relation(fields: [reporterId], references: [id])
  reason      String
  description String?
  status      ReportStatus @default(PENDING)
  createdAt   DateTime @default(now())
  
  @@index([showId])
  @@index([status])
}

enum ReportStatus {
  PENDING
  REVIEWED
  DISMISSED
  ACTION_TAKEN
}
```

Run migration:
```bash
npx prisma migrate dev --name add_show_reports
```

---

### Step 2: Create Repository

**File**: `repositories/show-report.repository.ts`

```typescript
import { prisma } from '@/lib/prisma'

class ShowReportRepository {
    /**
     * Create a new show report
     */
    async create(data: {
        showId: string
        reporterId: string
        reason: string
        description?: string
    }) {
        return prisma.showReport.create({
            data,
            include: {
                show: {
                    select: { title: true, creatorId: true }
                },
                reporter: {
                    select: { email: true, name: true }
                }
            }
        })
    }

    /**
     * Find report by ID
     */
    async findById(id: string) {
        return prisma.showReport.findUnique({
            where: { id },
            include: {
                show: true,
                reporter: {
                    select: { id: true, email: true, name: true }
                }
            }
        })
    }

    /**
     * Find all reports for a show
     */
    async findByShowId(showId: string) {
        return prisma.showReport.findMany({
            where: { showId },
            include: {
                reporter: {
                    select: { email: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    }

    /**
     * Find reports by status
     */
    async findByStatus(status: string) {
        return prisma.showReport.findMany({
            where: { status: status as any },
            include: {
                show: {
                    select: { id: true, title: true }
                },
                reporter: {
                    select: { email: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
    }

    /**
     * Update report status
     */
    async updateStatus(id: string, status: string) {
        return prisma.showReport.update({
            where: { id },
            data: { status: status as any }
        })
    }

    /**
     * Count reports by show
     */
    async countByShow(showId: string) {
        return prisma.showReport.count({
            where: { showId }
        })
    }
}

export const showReportRepository = new ShowReportRepository()
```

**Update**: `repositories/index.ts`
```typescript
export * from './show-report.repository'
```

---

### Step 3: Create Service

**File**: `services/reports/show-report.service.ts`

```typescript
import { showReportRepository } from '@/repositories'
import { showRepository } from '@/repositories'
import { ValidationError, NotFoundError } from '@/errors'

class ShowReportService {
    /**
     * Report a show
     */
    async reportShow(userId: string, data: {
        showId: string
        reason: string
        description?: string
    }) {
        // Validation
        if (!data.showId || !data.reason) {
            throw new ValidationError('Show ID and reason are required')
        }

        if (data.reason.length < 10) {
            throw new ValidationError('Reason must be at least 10 characters')
        }

        if (data.description && data.description.length > 1000) {
            throw new ValidationError('Description cannot exceed 1000 characters')
        }

        // Business logic: Check if show exists
        const show = await showRepository.findById(data.showId)
        if (!show) {
            throw new NotFoundError('Show')
        }

        // Business logic: Prevent duplicate reports
        const existingReports = await showReportRepository.findByShowId(data.showId)
        const userHasReported = existingReports.some(r => r.reporterId === userId)
        
        if (userHasReported) {
            throw new ValidationError('You have already reported this show')
        }

        // Create report
        const report = await showReportRepository.create({
            showId: data.showId,
            reporterId: userId,
            reason: data.reason,
            description: data.description
        })

        // Business logic: Auto-hide show if >= 5 reports
        const totalReports = await showReportRepository.countByShow(data.showId)
        if (totalReports >= 5) {
            await showRepository.update(data.showId, { 
                isPublished: false 
            })
        }

        return {
            success: true,
            report,
            message: 'Show reported successfully'
        }
    }

    /**
     * Get pending reports (admin only)
     */
    async getPendingReports() {
        return showReportRepository.findByStatus('PENDING')
    }

    /**
     * Review report (admin only)
     */
    async reviewReport(reportId: string, action: 'dismiss' | 'take_action') {
        if (!reportId || !action) {
            throw new ValidationError('Report ID and action are required')
        }

        const report = await showReportRepository.findById(reportId)
        if (!report) {
            throw new NotFoundError('Report')
        }

        const status = action === 'dismiss' ? 'DISMISSED' : 'ACTION_TAKEN'
        
        await showReportRepository.updateStatus(reportId, status)

        // If action taken, unpublish the show
        if (action === 'take_action') {
            await showRepository.update(report.showId, {
                isPublished: false
            })
        }

        return {
            success: true,
            message: `Report ${status.toLowerCase()}`
        }
    }
}

export const showReportService = new ShowReportService()
```

---

### Step 4: Create API Route

**File**: `app/api/v1/reports/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { showReportService } from '@/services/reports/show-report.service'
import { getCurrentUser } from '@/lib/auth'
import { mapErrorToResponse, UnauthorizedError } from '@/errors'

export async function POST(request: Request) {
    try {
        // 1. Authentication
        const user = await getCurrentUser()
        if (!user) {
            throw new UnauthorizedError()
        }

        // 2. Parse request
        const body = await request.json()

        // 3. Delegate to service
        const result = await showReportService.reportShow(user.id, body)

        // 4. Return response
        return NextResponse.json(result)
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}

export async function GET() {
    try {
        // 1. Authentication (admin only)
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            throw new UnauthorizedError('Admin access required')
        }

        // 2. Delegate to service
        const reports = await showReportService.getPendingReports()

        // 3. Return response
        return NextResponse.json({ reports })
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}
```

**File**: `app/api/v1/reports/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { showReportService } from '@/services/reports/show-report.service'
import { getCurrentUser } from '@/lib/auth'
import { mapErrorToResponse, UnauthorizedError } from '@/errors'

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Authentication (admin only)
        const user = await getCurrentUser()
        if (!user || user.role !== 'ADMIN') {
            throw new UnauthorizedError('Admin access required')
        }

        // 2. Parse request
        const { action } = await request.json()

        // 3. Delegate to service
        const result = await showReportService.reviewReport(params.id, action)

        // 4. Return response
        return NextResponse.json(result)
    } catch (error) {
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}
```

---

### Step 5: Update Documentation

**File**: `app/API.md` (add new section)

```markdown
## Reports (`/reports`)

### `POST /api/v1/reports`
Report an inappropriate show.
- **Auth Required**: Yes
- **Body**: `{ showId: string, reason: string, description?: string }`
- **Response**: `{ success: boolean, report: ShowReport }`

### `GET /api/v1/reports`
Get all pending reports (admin only).
- **Auth Required**: Yes (Admin)
- **Response**: `{ reports: ShowReport[] }`

### `PATCH /api/v1/reports/:id`
Review a report (admin only).
- **Auth Required**: Yes (Admin)
- **Body**: `{ action: 'dismiss' | 'take_action' }`
- **Response**: `{ success: boolean, message: string }`
```

---

## Layer 1: API Routes (Controllers)

### Purpose
Handle HTTP concerns ONLY. Routes are the "waiter" - they take orders and serve responses.

### Responsibilities
✅ **DO**:
- Authenticate requests
- Parse request body/params/query
- Delegate to services
- Format responses
- Map errors to HTTP status codes

❌ **DON'T**:
- Call Prisma directly
- Validate business rules
- Perform calculations
- Transform data
- Contain if/else business logic

### Template

```typescript
import { NextResponse } from 'next/server'
import { yourService } from '@/services/domain/your.service'
import { getCurrentUser } from '@/lib/auth'
import { mapErrorToResponse, UnauthorizedError } from '@/errors'

export async function METHOD(request: Request) {
    try {
        // STEP 1: Authentication (if needed)
        const user = await getCurrentUser()
        if (!user) {
            throw new UnauthorizedError()
        }

        // STEP 2: Parse request data
        const body = await request.json()
        const { searchParams } = new URL(request.url)
        const queryParam = searchParams.get('param')

        // STEP 3: Delegate to service (ONE LINE)
        const result = await yourService.methodName(user.id, body)

        // STEP 4: Return response
        return NextResponse.json(result)
    } catch (error) {
        // STEP 5: Error handling (standardized)
        const { status, error: message } = mapErrorToResponse(error)
        return NextResponse.json({ error: message }, { status })
    }
}
```

### Size Guidelines
- **Target**: 15-25 lines per handler
- **Maximum**: 40 lines (if exceeded, extract logic to service)
- **Minimum logic**: Only auth, parse, delegate, respond

### Common Patterns

#### Pattern: Query Parameters
```typescript
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const result = await service.paginate(page, limit)
    return NextResponse.json(result)
}
```

#### Pattern: Route Parameters
```typescript
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const result = await service.getById(params.id)
    return NextResponse.json(result)
}
```

#### Pattern: File Upload
```typescript
export async function POST(request: Request) {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const metadata = formData.get('metadata') as string
    
    const result = await service.uploadFile(file, JSON.parse(metadata))
    return NextResponse.json(result)
}
```

---

## Layer 2: Services (Business Logic)

### Purpose
Contain ALL business logic. Services are the "chef" - they cook the food according to recipes.

### Responsibilities
✅ **DO**:
- Validate input (business rules, not just type checks)
- Execute business logic
- Coordinate multiple repositories
- Throw domain errors
- Orchestrate complex workflows
- Implement business calculations

❌ **DON'T**:
- Call Prisma directly
- Create HTTP responses
- Handle authentication
- Parse request bodies
- Return NextResponse objects

### Template

```typescript
import { repository1, repository2 } from '@/repositories'
import { ValidationError, NotFoundError, BusinessError } from '@/errors'

class YourService {
    /**
     * Method description
     * @throws ValidationError if validation fails
     * @throws NotFoundError if entity not found
     */
    async methodName(userId: string, data: InputType) {
        // STEP 1: Input validation
        if (!data.requiredField) {
            throw new ValidationError('Required field is missing')
        }

        if (data.amount < 0) {
            throw new ValidationError('Amount must be positive')
        }

        // STEP 2: Fetch required data via repositories
        const user = await repository1.findById(userId)
        if (!user) {
            throw new NotFoundError('User')
        }

        const relatedEntity = await repository2.findByUserId(userId)

        // STEP 3: Business logic
        if (user.status !== 'ACTIVE') {
            throw new BusinessError('User must be active')
        }

        const calculatedValue = this.calculateSomething(data, relatedEntity)

        // STEP 4: Persist changes via repositories
        const result = await repository1.create({
            userId,
            value: calculatedValue,
            ...data
        })

        // STEP 5: Additional business logic
        if (calculatedValue > 1000) {
            await repository2.notify(userId, 'High value transaction')
        }

        // STEP 6: Return result
        return {
            success: true,
            data: result,
            message: 'Operation completed successfully'
        }
    }

    /**
     * Private helper methods for complex calculations
     */
    private calculateSomething(data: InputType, entity: any): number {
        return data.amount * entity.multiplier
    }
}

export const yourService = new YourService()
```

### Validation Guidelines

```typescript
// ✅ GOOD - Business rule validation
if (booking.quantity > show.availableSeats) {
    throw new ValidationError('Not enough seats available')
}

if (user.role === 'COMEDIAN_UNVERIFIED') {
    throw new BusinessError('Comedian must be verified to create shows')
}

// ❌ BAD - Type validation (use TypeScript types instead)
if (typeof data.name !== 'string') {
    throw new ValidationError('Name must be a string')
}
```

### Error Throwing
```typescript
import { 
    ValidationError,      // 400 - Bad input
    UnauthorizedError,    // 401 - Not authenticated
    ForbiddenError,       // 403 - Not allowed
    NotFoundError,        // 404 - Resource not found
    ConflictError,        // 409 - Duplicate/conflict
    BusinessError         // 422 - Business rule violation
} from '@/errors'

// Use the most specific error type
throw new NotFoundError('Show')  // Better than generic error
throw new ValidationError('Email format invalid')
throw new ConflictError('Email already exists')
```

---

## Layer 3: Repositories (Data Access)

### Purpose
Encapsulate database operations. Repositories are the "pantry manager" - they get ingredients.

### Responsibilities
✅ **DO**:
- Execute Prisma queries
- Build complex queries
- Handle transactions
- Return raw database entities
- Include related data (foreign keys)

❌ **DON'T**:
- Validate business rules
- Throw business errors (except DB errors)
- Transform/calculate data
- Contain if/else logic (except query building)

### Template

```typescript
import { prisma } from '@/lib/prisma'

class YourRepository {
    /**
     * Find entity by ID
     */
    async findById(id: string) {
        return prisma.yourEntity.findUnique({
            where: { id },
            include: {
                relatedEntity: true  // Include if commonly needed
            }
        })
    }

    /**
     * Find many with flexible filtering
     */
    async findMany(where?: any) {
        return prisma.yourEntity.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        })
    }

    /**
     * Create new entity
     */
    async create(data: any) {
        return prisma.yourEntity.create({
            data,
            include: {
                relatedEntity: true
            }
        })
    }

    /**
     * Update entity
     */
    async update(id: string, data: any) {
        return prisma.yourEntity.update({
            where: { id },
            data
        })
    }

    /**
     * Upsert (create or update)
     */
    async upsert(uniqueField: string, data: any) {
        return prisma.yourEntity.upsert({
            where: { uniqueField },
            create: data,
            update: data
        })
    }

    /**
     * Delete entity
     */
    async delete(id: string) {
        return prisma.yourEntity.delete({
            where: { id }
        })
    }

    /**
     * Count entities
     */
    async count(where?: any) {
        return prisma.yourEntity.count({ where })
    }

    /**
     * Complex query with raw SQL (when needed)
     */
    async findWithComplexJoin(params: any) {
        return prisma.$queryRaw`
            SELECT ...
            FROM ...
            WHERE ...
        `
    }
}

export const yourRepository = new YourRepository()
```

### Transaction Pattern

```typescript
class OrderRepository {
    /**
     * Create order with transaction support
     */
    async createWithItems(orderData: any, items: any[], tx?: any) {
        const db = tx || prisma
        
        const order = await db.order.create({ data: orderData })
        
        await db.orderItem.createMany({
            data: items.map(item => ({
                orderId: order.id,
                ...item
            }))
        })
        
        return order
    }
}

// Usage in service
await prisma.$transaction(async (tx) => {
    const order = await orderRepository.createWithItems(data, items, tx)
    await paymentRepository.charge(order.total, tx)
})
```

---

## Error Handling

### Domain Errors (in services/repositories)

```typescript
import { 
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    BusinessError
} from '@/errors'

// Service example
if (!user) {
    throw new NotFoundError('User')
}

if (booking.userId !== currentUserId) {
    throw new ForbiddenError('Cannot modify others\' bookings')
}
```

### HTTP Error Mapping (in routes)

```typescript
import { mapErrorToResponse } from '@/errors'

try {
    const result = await service.method()
    return NextResponse.json(result)
} catch (error) {
    // Automatically maps domain errors to HTTP status codes
    const { status, error: message } = mapErrorToResponse(error)
    return NextResponse.json({ error: message }, { status })
}
```

### Custom Errors

```typescript
// errors/custom.ts
export class InsufficientCreditsError extends Error {
    constructor(required: number, available: number) {
        super(`Insufficient credits: need ${required}, have ${available}`)
        this.name = 'InsufficientCreditsError'
    }
}

// errors/index.ts - Add mapping
export function mapErrorToResponse(error: any) {
    // ...existing mappings
    if (error instanceof InsufficientCreditsError) {
        return { status: 402, error: error.message }  // 402 Payment Required
    }
}
```

---

## Testing Guidelines

### Unit Testing Services

```typescript
import { yourService } from '@/services/domain/your.service'
import { repository1, repository2 } from '@/repositories'

// Mock repositories
jest.mock('@/repositories')

describe('YourService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('methodName', () => {
        it('should throw ValidationError for invalid input', async () => {
            await expect(
                yourService.methodName('user-id', { invalid: 'data' })
            ).rejects.toThrow(ValidationError)
        })

        it('should throw NotFoundError if user not found', async () => {
            repository1.findById.mockResolvedValue(null)

            await expect(
                yourService.methodName('user-id', { valid: 'data' })
            ).rejects.toThrow(NotFoundError)
        })

        it('should create entity successfully', async () => {
            repository1.findById.mockResolvedValue({ id: 'user-id' })
            repository2.create.mockResolvedValue({ id: 'entity-id' })

            const result = await yourService.methodName('user-id', { 
                valid: 'data' 
            })

            expect(result.success).toBe(true)
            expect(repository2.create).toHaveBeenCalledWith(
                expect.objectContaining({ valid: 'data' })
            )
        })
    })
})
```

### Integration Testing Routes

```typescript
import { POST } from '@/app/api/v1/your-route/route'
import { yourService } from '@/services/domain/your.service'

jest.mock('@/services/domain/your.service')
jest.mock('@/lib/auth')

describe('POST /api/v1/your-route', () => {
    it('should return 401 if not authenticated', async () => {
        getCurrentUser.mockResolvedValue(null)

        const request = new Request('http://localhost/api/v1/your-route', {
            method: 'POST',
            body: JSON.stringify({ data: 'test' })
        })

        const response = await POST(request)
        expect(response.status).toBe(401)
    })

    it('should create entity successfully', async () => {
        getCurrentUser.mockResolvedValue({ id: 'user-id' })
        yourService.methodName.mockResolvedValue({ 
            success: true, 
            data: { id: 'entity-id' } 
        })

        const request = new Request('http://localhost/api/v1/your-route', {
            method: 'POST',
            body: JSON.stringify({ valid: 'data' })
        })

        const response = await POST(request)
        const json = await response.json()

        expect(response.status).toBe(200)
        expect(json.success).toBe(true)
    })
})
```

---

## Code Review Checklist

### For Routes ✅
- [ ] Handler is ≤40 lines
- [ ] No Prisma imports or calls
- [ ] Uses `getCurrentUser()` for auth
- [ ] Delegates to service (single call)
- [ ] Uses `mapErrorToResponse()` for errors
- [ ] Returns `NextResponse.json()`
- [ ] No business logic (if/else, calculations)

### For Services ✅
- [ ] No Prisma imports or calls
- [ ] Uses repositories for data access
- [ ] Validates all inputs
- [ ] Throws domain errors (not HTTP responses)
- [ ] Has JSDoc comments
- [ ] Business logic is clear and testable
- [ ] Returns plain objects (not NextResponse)

### For Repositories ✅
- [ ] Only contains Prisma calls
- [ ] No business logic
- [ ] Returns raw Prisma entities
- [ ] Methods are simple and focused
- [ ] Supports flexible `where` clauses
- [ ] Includes common relationships

### General ✅
- [ ] TypeScript types are defined
- [ ] Error messages are user-friendly
- [ ] Code follows existing patterns
- [ ] Tests are included
- [ ] Documentation is updated

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Skipping Layers

```typescript
// ❌ BAD - Route calling Prisma directly
export async function POST(request: Request) {
    const user = await prisma.user.create({ ... })  // NO!
    return NextResponse.json(user)
}

// ✅ GOOD - Route delegates to service
export async function POST(request: Request) {
    const result = await userService.createUser(data)
    return NextResponse.json(result)
}
```

### ❌ Anti-Pattern 2: Business Logic in Routes

```typescript
// ❌ BAD - Validation in route
export async function POST(request: Request) {
    const { age } = await request.json()
    if (age < 18) {  // NO! This is business logic
        return NextResponse.json({ error: 'Too young' }, { status: 400 })
    }
}

// ✅ GOOD - Validation in service
class UserService {
    async createUser(data: any) {
        if (data.age < 18) {  // YES! Business rule in service
            throw new ValidationError('Must be 18 or older')
        }
    }
}
```

### ❌ Anti-Pattern 3: Services Returning HTTP Responses

```typescript
// ❌ BAD - Service returning NextResponse
class UserService {
    async getUser(id: string) {
        const user = await userRepository.findById(id)
        return NextResponse.json(user)  // NO! Services don't know about HTTP
    }
}

// ✅ GOOD - Service returns plain object
class UserService {
    async getUser(id: string) {
        const user = await userRepository.findById(id)
        if (!user) throw new NotFoundError('User')
        return user  // YES! Return data, route handles response
    }
}
```

### ❌ Anti-Pattern 4: Repositories with Business Logic

```typescript
// ❌ BAD - Repository validating
class UserRepository {
    async create(data: any) {
        if (data.age < 18) {  // NO! Business logic in repository
            throw new Error('Too young')
        }
        return prisma.user.create({ data })
    }
}

// ✅ GOOD - Repository is pure data access
class UserRepository {
    async create(data: any) {
        return prisma.user.create({ data })  // YES! Just query
    }
}
```

### ❌ Anti-Pattern 5: God Services

```typescript
// ❌ BAD - One service does everything
class UserService {
    async createUser() { }
    async updateUser() { }
    async deleteUser() { }
    async createShow() { }      // NO! Show logic should be separate
    async bookShow() { }         // NO! Booking logic should be separate
    async processPayment() { }   // NO! Payment logic should be separate
}

// ✅ GOOD - Focused services
class UserService { ... }
class ShowService { ... }
class BookingService { ... }
class PaymentService { ... }
```

---

## Common Scenarios

### Scenario 1: Complex Query with Filters

**Route**: Parse & delegate
```typescript
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const filters = {
        city: searchParams.get('city'),
        minPrice: searchParams.get('minPrice'),
        maxPrice: searchParams.get('maxPrice')
    }
    
    const result = await showService.searchShows(filters)
    return NextResponse.json(result)
}
```

**Service**: Validate & orchestrate
```typescript
async searchShows(filters: SearchFilters) {
    if (filters.minPrice && filters.maxPrice) {
        if (filters.minPrice > filters.maxPrice) {
            throw new ValidationError('Min price cannot exceed max price')
        }
    }
    
    return showRepository.findMany({
        city: filters.city,
        ticketPrice: {
            gte: filters.minPrice,
            lte: filters.maxPrice
        }
    })
}
```

**Repository**: Query only
```typescript
async findMany(where: any) {
    return prisma.show.findMany({ where })
}
```

---

### Scenario 2: Creating Related Entities

**Service**: Orchestrate transaction
```typescript
async createShowWithInventory(userId: string, data: any) {
    // Validation
    if (data.totalTickets < 1) {
        throw new ValidationError('Must have at least 1 ticket')
    }
    
    // Transaction
    return prisma.$transaction(async (tx) => {
        const show = await showRepository.create(data, tx)
        
        await ticketRepository.createInventory({
            showId: show.id,
            totalTickets: data.totalTickets,
            availableTickets: data.totalTickets
        }, tx)
        
        return show
    })
}
```

**Repository**: Accept transaction
```typescript
async create(data: any, tx?: any) {
    const db = tx || prisma
    return db.show.create({ data })
}
```

---

### Scenario 3: Scheduled Jobs/Background Tasks

```typescript
// jobs/cleanup-expired-shows.ts
import { showService } from '@/services/shows/show.service'

export async function cleanupExpiredShows() {
    // Jobs can directly call services (they're not HTTP routes)
    await showService.archiveExpiredShows()
}
```

---

## Migration from Legacy Code

If you encounter old code that violates architecture:

### Step 1: Identify Violations
```typescript
// Old route with Prisma calls
export async function POST(request: Request) {
    const data = await request.json()
    const user = await prisma.user.create({ data })  // ⚠️ Violation
    return NextResponse.json(user)
}
```

### Step 2: Extract to Repository
```typescript
class UserRepository {
    async create(data: any) {
        return prisma.user.create({ data })
    }
}
```

### Step 3: Create Service
```typescript
class UserService {
    async createUser(data: any) {
        if (!data.email) {
            throw new ValidationError('Email required')
        }
        return userRepository.create(data)
    }
}
```

### Step 4: Update Route
```typescript
export async function POST(request: Request) {
    const data = await request.json()
    const result = await userService.createUser(data)
    return NextResponse.json(result)
}
```

---

## Quick Reference

### File Organization

```
packages/backend/
├── app/api/v1/                  # Routes
│   ├── admin/                   # Admin routes
│   ├── shows/                   # Show routes
│   └── users/                   # User routes
├── services/                    # Business logic
│   ├── admin/                   # Admin services
│   ├── shows/                   # Show services
│   └── users/                   # User services
├── repositories/                # Data access
│   ├── show.repository.ts
│   ├── user.repository.ts
│   └── index.ts                # Export all repositories
└── errors/                      # Domain errors
    └── index.ts
```

### Import Paths

```typescript
// Routes
import { service } from '@/services/domain/service-name.service'
import { getCurrentUser } from '@/lib/auth'
import { mapErrorToResponse } from '@/errors'

// Services
import { repository } from '@/repositories'
import { ValidationError, NotFoundError } from '@/errors'

// Repositories
import { prisma } from '@/lib/prisma'
```

---

## Enforcement

These guidelines are **MANDATORY**. Code that violates them will be rejected in PR review.

**Automated Checks** (future):
- ESLint rule: No Prisma imports in routes
- ESLint rule: No NextResponse in services
- Test coverage requirements

**PR Review**: Every PR must pass the Code Review Checklist in this document.

---

## Questions?

- **Architecture**: See [`SYSTEM_DESIGN.md`](file:///Users/samarthsaraswat/Codebases/comedy-connect/docs/SYSTEM_DESIGN.md)
- **Services**: See [`SERVICES.md`](file:///Users/samarthsaraswat/Codebases/comedy-connect/packages/backend/SERVICES.md)
- **Repositories**: See [`REPOSITORIES.md`](file:///Users/samarthsaraswat/Codebases/comedy-connect/packages/backend/REPOSITORIES.md)
- **API Endpoints**: See [`API.md`](file:///Users/samarthsaraswat/Codebases/comedy-connect/packages/backend/app/API.md)

---

**Last Updated**: 2026-01-30  
**Maintainers**: Backend Team  
**Version**: 1.0.0 (Post-Refactoring)
