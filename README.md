# Comedy Connect

A comprehensive platform for discovering, booking, and managing live comedy shows in Hyderabad.

> [!NOTE]
> **Razorpay Integration**: Please note that Razorpay payment integration has not been completed yet and will be added in a future update. Current bookings are handled without actual payment processing.


## 🏗️ Architecture: Decoupled Monorepo

Comedy Connect has been migrated to a **decoupled monorepo** architecture to support independent development of the Frontend and Backend services.

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

## 📚 Documentation

Detailed documentation for different aspects of the project can be found in the `docs/` directory:

- [**API Documentation**](docs/API.md): Detailed endpoints for Auth, Shows, Bookings, and Admin.
- [**Database Schema**](docs/DATABASE.md): Data models, relationships, and roles.
- [**Authentication & Security**](docs/AUTHENTICATION.md): OAuth flow, RBAC, and middleware.
- [**Testing Guide**](docs/TESTING.md): Setup, commands, and architecture.
- [**Components & Architecture**](docs/COMPONENTS.md): Frontend structure and design system.

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
