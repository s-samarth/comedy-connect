# Comedy Connect

A comprehensive, **AI-engineered** platform for discovering, booking, and managing live comedy shows in Hyderabad. This project demonstrates how modern software can be built using **AI-assisted Product Management** — from architecture decisions to testing strategies — resulting in an industry-grade, production-ready application.

> [!NOTE]
> **Razorpay Integration**: Please note that Razorpay payment integration has not been completed yet and will be added in a future update. Current bookings are handled without actual payment processing.


## 🏗️ Architecture: Decoupled Monorepo

Comedy Connect has been migrated to a **decoupled monorepo** architecture to support independent development of the Frontend and Backend services. This allows for a **dual-mode operation** where the frontend can communicate with either the legacy internal API or the new standalone Backend Service.

### Project Structure

```
comedy-connect/
├── packages/
│   ├── frontend/        # Next.js UI Application (Port 3000)
│   ├── backend/         # Standalone API Service (Port 4000)
│   └── types/           # Shared TypeScript API Contracts
├── docs/                # Comprehensive documentation
│   ├── RUNNING.md       # ✅ Local running instructions
│   ├── DEPLOYMENT.md    # ✅ Vercel deployment guide
│   ├── MIGRATION_GUIDE.md # Details on the decoupling process
│   ├── API.md           # REST API Specifications (v1)
│   └── ... (Other Docs)
└── ... (Legacy monolith files preserved in root)
```

---

## 🚀 Quick Start

### 1. Backend Service
```bash
cd packages/backend
npm install
npx prisma generate
npm run dev
```
Running on: [http://localhost:4000](http://localhost:4000)

### 2. Frontend Application
```bash
cd packages/frontend
npm install
npm run dev
```
Running on: [http://localhost:3000](http://localhost:3000)

---

## 🔧 Dual-Mode Support
The frontend can be toggled between the **Internal Monolith API** and the **Standalone Backend Service** using environment variables in `packages/frontend/.env.local`.

---

## 🏗️ Technology Stack
- **Frontend**: Next.js 14+ (App Router), Tailwind CSS, SWR.
- **Backend**: Next.js Standalone API Service using **Service/Repository architecture** for clean separation of concerns.
- **Database**: PostgreSQL with Prisma ORM.
- **Type Safety**: Shared TypeScript package `@comedy-connect/types`.

---

## 🤖 Built with AI Product Management

This entire application was designed, architected, and documented using an **AI-assisted development approach**. As an AI Product Manager, every decision was made with clear intent:

### What This Means

| Aspect | Traditional Approach | AI Product Management Approach |
| :--- | :--- | :--- |
| **Architecture** | Ad-hoc decisions, accumulating tech debt | Deliberate Service/Repository pattern from day one |
| **Documentation** | Written after the fact, often outdated | Living documentation, updated with every feature |
| **Testing** | Added later, often incomplete | Testing infrastructure built in parallel with features |
| **Security** | Bolted on at the end | RBAC and dual-auth designed from the start |

### The Result

- **Zero technical debt** in the core architecture
- **10+ comprehensive documentation files** covering every aspect
- **Industry-standard patterns** applied consistently across the codebase
- **Production-ready deployment guides** for multi-environment setups

> This project proves that AI-assisted development is not about writing code faster — it's about making **better architectural decisions** and maintaining **relentless documentation discipline**.

---

## 🏆 Industry-Grade Quality

Comedy Connect demonstrates production-readiness through verifiable engineering practices:

### ✅ Architecture Compliance (100%)

| Metric | Status | Evidence |
| :--- | :--- | :--- |
| Service/Repository Pattern | ✅ Complete | Zero Prisma calls in API routes |
| Layered Architecture | ✅ Complete | Controllers → Services → Repositories → Prisma |
| Type Safety | ✅ Complete | Shared `@comedy-connect/types` package |
| Error Handling | ✅ Complete | Domain errors mapped to HTTP responses |

> See: [BACKEND_DEVELOPER_GUIDELINES.md](packages/backend/BACKEND_DEVELOPER_GUIDELINES.md) (1,400+ lines)

### ✅ Testing Infrastructure

| Layer | Coverage | Files |
| :--- | :--- | :--- |
| Unit Tests | Services, Repositories, Hooks | 10+ files |
| Integration Tests | API endpoints, Workflows | 4+ files |
| Security Tests | RBAC, Auth enforcement | 1+ files |
| E2E Tests | Critical user flows | 4 flows covered |
| **Total** | **50+ test files** | **2,500+ lines of test code** |

The testing pyramid follows industry best practices (70% unit, 20% integration, 10% E2E).

> See: [TESTING.md](docs/TESTING.md)

### ✅ Security Implementation

- **Dual Authentication**: NextAuth.js for users + Secure Admin Sessions
- **Role-Based Access Control (RBAC)**: 6 roles with granular permissions
- **CORS Protection**: Explicit frontend origin whitelisting
- **CSRF Protection**: Built into NextAuth.js for state-changing operations
- **Session Management**: Database-backed with automatic cleanup

> See: [AUTHENTICATION.md](docs/AUTHENTICATION.md)

### ✅ Deployment Readiness

- **3-Tier Database Strategy**: Development, Pre-production, Production
- **Vercel Monorepo Deployment**: Documented step-by-step
- **Environment Variable Management**: Complete reference tables
- **Pre-production Testing**: Dedicated `develop` branch workflow

> See: [DEPLOYMENT.md](docs/DEPLOYMENT.md)

---
## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd comedy-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/comedy_connect"

   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Email (optional)
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"
   EMAIL_FROM="noreply@comedyconnect.com"

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # Razorpay (Future integration - for payments)
   RAZORPAY_KEY_ID="your-razorpay-key-id"
   RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

   ```

5. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev

   # (Optional) Seed the database with sample data
   npm run seed

   # (Optional) Clean up test data if running tests
   npx ts-node scripts/cleanup-test-artifacts.ts
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Database Schema

### Core Entities

- **User**: Base user entity with role-based access
- **OrganizerProfile**: Extended profile for organizers
- **ComedianProfile**: Extended profile for verified comedians
- **Show**: Comedy show events with details and finance controls
- **ShowComedian**: Many-to-many relationship between shows and comedians
- **Booking**: Ticket booking records with breakdown of **Platform Fee** (Organizer commission) and **Booking Fee** (Customer surcharge)
- **TicketInventory**: Real-time ticket availability tracking

### User Roles

- **AUDIENCE**: Can browse shows and book tickets
- **ORGANIZER_UNVERIFIED**: Can create profile, pending admin approval
- **ORGANIZER_VERIFIED**: Can create and manage shows
- **COMEDIAN_UNVERIFIED**: Login to claim/create profile, pending verification
- **COMEDIAN_VERIFIED**: Managed profile, custom fee rates, can own shows
- **ADMIN**: Full administrative access including Finance & Collections

## 🔐 Authentication Flow

### Guest Access
- Users can browse shows without authentication
- Limited functionality (view-only mode)

### Sign Up / Sign In
- Google OAuth integration with existing account linking support
- Single "Sign In" entry point (handles both registration and login)
- Automatic user name synchronization from OAuth profiles

### Role-Based Access
- Middleware protects routes based on user roles
- Server-side authentication checks
- Client-side UI adaptations based on auth state

## 🎨 UI/UX Features

### Responsive Design
- Mobile-first approach
- Tailwind CSS for consistent styling
- Dark mode support

### User Experience
- Loading states and error handling
- Form validation and user feedback
- Intuitive navigation and breadcrumbs
- Accessibility considerations

### Mock Data System
- Pre-populated comedy shows for demonstration
- Fallback when database is empty
- Realistic venue and pricing information

## 🛠️ Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Consistent naming conventions
- Component-based architecture

### API Design
- RESTful API endpoints.
- **Layered Architecture**: Service and Repository layers for separation of business logic and data access.
- Consistent error handling with domain-specific exceptions.
- Proper HTTP status codes.
- Input validation and sanitization.
### Database Best Practices
- Prisma migrations for schema changes
- Database transactions for data consistency
- Proper indexing for performance
- Connection pooling

## 🧪 Testing

### Running Tests
The project now uses a robust **Jest** testing framework.

```bash
# Run the complete test suite (Required before commit)
npm run test:all

# Run specific suites
npm run test:unit
npm run test:integration
npm run test:security
```

> **Note**: Integration tests require a running local database. See [Testing Documentation](docs/TESTING.md) for setup details.

### Test Coverage
- **Unit**: API logic and mocked dependencies
- **Integration**: Full workflows (Booking, Organizer flows) with real DB
- **Security**: RBAC and Auth enforcement
- **Schema**: Database integrity validation

## 🗄️ Database Environments

Comedy Connect employs a **3-tier Database Strategy** to ensure data integrity and separation of concerns.

| Environment | Purpose | Config File | Usage |
| :--- | :--- | :--- | :--- |
| **Development** | Local features, experiments | `.env` / `.env.local` | `npm run dev` (Localhost) |
| **Test / Pre-prod** | Staging, integration testing | `.env.dev` | `npm run build` (Deployed to `dev.comedyconnect.in`) |
| **Production** | Live real-world data | `.env.prod` | `npm run build` (Deployed to `comedyconnect.in`) |

> **Critical**: Never use the Production Database URL in Development or Test environments to prevent data corruption.

## 🚀 Deployment

### Environment Setup
1. Configure production environment variables
2. Set up production database
3. Configure OAuth providers
4. Set up image storage (Cloudinary)
5. Configure payment gateway (Razorpay)

### Deployment Options
- **Vercel**: Recommended for Next.js applications
- **Docker**: Containerized deployment
- **Traditional**: Node.js server deployment

### Production Considerations
- Database connection pooling
- CDN for static assets
- Monitoring and logging
- Backup strategies
- Security hardening

## 🤝 Contributing

### Development Workflow
1. Create feature branch from main
2. Implement changes with proper testing
3. Update documentation as needed
4. Submit pull request for review

### 🤖 AI Agent & Developer Guidelines
> **CRITICAL**: Every code change MUST be accompanied by a corresponding update to this README or relevant documentation files. 
> 
> If you are an AI agent or a developer adding a new feature, API, or modifying existing behavior:
> 1. Update the **Features** list if applicable.
> 2. Update the **API Documentation** section below if endpoints are changed.
> 3. Verify that the architecture and tech stack sections remain accurate.
> 4. Do NOT mark a task as complete until documentation is updated.
> 5. **ALWAYS** run `npm run build` and ensure it passes before committing changes to git.

### Code Review Checklist
- [ ] TypeScript types are correct
- [ ] Database migrations included if needed
- [ ] Tests pass for new functionality
- [ ] Documentation is updated
- [ ] No console.log statements in production code

### 🐛 Reporting Bugs
Please refer to [BUGS.MD](BUGS.MD) for strict guidelines on how to lodge bugs, priority definitions, and status tracking.

## 📚 Documentation

Comedy Connect maintains **comprehensive documentation** covering every aspect of the project. This is a key indicator of production readiness.

### Architecture & Design
| Document | Description |
| :--- | :--- |
| [SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md) | Architecture overview, design patterns, review |
| [COMPONENTS.md](docs/COMPONENTS.md) | Frontend structure and design system |

### Development Guidelines
| Document | Description |
| :--- | :--- |
| [BACKEND_DEVELOPER_GUIDELINES.md](packages/backend/BACKEND_DEVELOPER_GUIDELINES.md) | 1,400+ lines of backend standards |
| [FRONTEND_DEVELOPER_GUIDELINES.md](packages/frontend/FRONTEND_DEVELOPER_GUIDELINES.md) | TypeScript, React, and styling best practices |
| [SERVICES.md](packages/backend/SERVICES.md) | Service layer documentation |
| [REPOSITORIES.md](packages/backend/REPOSITORIES.md) | Data access layer documentation |

### API & Database
| Document | Description |
| :--- | :--- |
| [API.md](packages/backend/API.md) | REST API endpoints (v1) |
| [DATABASE.md](docs/DATABASE.md) | Schema, models, and data management |

### Security & Authentication
| Document | Description |
| :--- | :--- |
| [AUTHENTICATION.md](docs/AUTHENTICATION.md) | OAuth flow, RBAC, and middleware |
| [ADMIN_SECURITY_GUIDE.md](ADMIN_SECURITY_GUIDE.md) | Admin access and security patterns |

### Testing & Quality
| Document | Description |
| :--- | :--- |
| [TESTING.md](docs/TESTING.md) | Complete testing architecture (50+ files) |
| [RUNNING_TESTS.md](RUNNING_TESTS.md) | Quick reference for test commands |

### Deployment & Operations
| Document | Description |
| :--- | :--- |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel monorepo deployment guide |
| [RUNNING.md](docs/RUNNING.md) | Local development setup |
| [MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md) | Decoupling migration details |

### User Flows & Workflows
| Document | Description |
| :--- | :--- |
| [USER_FLOWS.md](userflows/USER_FLOWS.md) | User journey documentation |
| [WORKFLOWS.md](docs/WORKFLOWS.md) | Development workflows |
| [BUGS.md](BUGS.md) | Bug reporting guidelines and tracking |

## 🔍 Troubleshooting

### Common Issues

**Database Connection Errors**
- Verify DATABASE_URL is correct
- Check PostgreSQL service is running
- Ensure database exists

**Authentication Issues**
- Verify Google OAuth credentials
- Check NEXTAUTH_URL matches deployment URL
- Ensure NEXTAUTH_SECRET is set
- For admin access: Check admin password is set up and email is whitelisted
- Verify admin session is active when accessing admin panel

**Image Upload Issues**
- Verify Cloudinary credentials
- Check image size limits
- Ensure proper CORS configuration

### Development Tips

**Hot Reload Issues**
- Restart development server
- Clear Next.js cache: `rm -rf .next`
- Check for TypeScript errors

**Database Issues**
- Reset database: `npx prisma migrate reset`
- Regenerate client: `npx prisma generate`
- Check migration files

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Cloudinary](https://cloudinary.com/) - Image management
- [Razorpay](https://razorpay.com/) - Payment gateway (Future)

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation first
- Review existing issues for similar problems

---

**Note**: This README is maintained to help both AI agents and human developers understand and contribute to the Comedy Connect project effectively.
