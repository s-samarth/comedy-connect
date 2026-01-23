# Comedy Connect

A comprehensive platform for discovering, booking, and managing live comedy shows in Hyderabad. Built with Next.js, TypeScript, and Prisma.

## 🎭 Overview

Comedy Connect is a full-stack web application that connects comedy enthusiasts with live comedy events. It supports multiple user roles including audience members, comedians, organizers, and administrators.

### Key Features

- **Guest Browsing**: Browse comedy shows without authentication (Sign in required only to book)
- **User Authentication**: Sign up/sign in with Google OAuth
- **Show Discovery**: Filter and search comedy events by date, price, and venue
- **Ticket Booking**: Secure direct booking flow with atomic inventory management (payment-free in current phase)
- **My Bookings**: View and manage all your personal show tickets in one place
- **Identity Management**: User names captured from Google OAuth and displayed across the platform
- **Unified Auth**: Single "Sign In" flow for new and returning users alike
- **Show Management**: Organizers can create and manage their comedy shows
- **Comedian Management**: Add and manage comedian profiles
- **Admin Dashboard**: Secure administrative oversight with password protection
- **Admin Security**: Enhanced security with password hashing and reset capabilities
- **Mock Data**: Pre-populated with sample comedy shows for demonstration

## 🏗️ Architecture

### Technology Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL with Prisma ORM
- **Type Safety**: TypeScript throughout
- **Image Handling**: Cloudinary integration for show posters
- **Payment**: Razorpay integration (coming soon)

### Project Structure

```
comedy-connect/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # NextAuth.js authentication
│   │   ├── admin/                # Admin endpoints
│   │   ├── shows/                # Shows CRUD operations
│   │   └── organizers/           # Organizer management
│   │   ├── organizers/           # Organizer management
│   ├── admin/                    # Admin dashboard with password protection
│   │   ├── admin-secure/         # Secure admin routes
│   │   ├── organizers/           # Organizer management pages
│   │   ├── shows/                # Show management pages
│   │   └── fees/                 # Platform configuration pages
│   ├── organizer/                # Organizer dashboard pages
│   ├── shows/                    # Show discovery and booking
│   └── api/auth/signin/          # Custom sign-in page
├── components/                   # Reusable React components
│   ├── admin/                    # Admin-specific components
│   │   ├── AdminPasswordPrompt.tsx    # Admin authentication
│   │   ├── AdminPasswordReset.tsx     # Password reset functionality
│   │   ├── DatabaseCleanup.tsx        # Database management tools
│   │   ├── OrganizerManagement.tsx    # Organizer approval system
│   │   ├── ShowManagement.tsx         # Show moderation tools
│   │   └── FeeManagement.tsx          # Platform fee configuration
│   ├── organizer/                # Organizer-specific components
│   ├── shows/                    # Show-related components
│   ├── ui/                       # Shared UI components
│   └── providers/                # Context providers
├── lib/                          # Utility libraries
│   ├── auth.ts                   # Authentication helpers
│   ├── email.ts                  # Email functionality
│   ├── admin-security.ts         # Admin password protection
│   ├── admin-password.ts         # Admin password utilities
│   ├── prisma.ts                 # Prisma client
│   ├── cloudinary.ts             # Image upload utilities
│   └── concurrency.ts            # Database concurrency handling
├── prisma/                       # Database schema and migrations
│   ├── schema.prisma             # Prisma schema definition
│   └── migrations/               # Database migration files
├── types/                        # TypeScript type definitions
├── scripts/                      # Utility scripts
│   ├── check-admin-status.js     # Check admin status
│   ├── get-reset-code.js         # Get admin reset code
│   ├── reset-admin-hash.js       # Reset admin password hash
│   ├── cleanup-database.js       # Database cleanup utility
│   ├── seedMockData.ts           # Mock data seeding
│   └── setup-admin.sh            # Admin setup script
└── public/                       # Static assets
```

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

   # Razorpay (for payments)
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
- **Comedian**: Comedian profiles and information
- **Show**: Comedy show events with details
- **ShowComedian**: Many-to-many relationship between shows and comedians
- **Booking**: Ticket booking records
- **TicketInventory**: Real-time ticket availability tracking

### User Roles

- **AUDIENCE**: Can browse shows and book tickets
- **ORGANIZER_UNVERIFIED**: Can create profile, pending admin approval
- **ORGANIZER_VERIFIED**: Can create and manage shows
- **ADMIN**: Full administrative access

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
- RESTful API endpoints
- Consistent error handling
- Proper HTTP status codes
- Input validation and sanitization

### Database Best Practices
- Prisma migrations for schema changes
- Database transactions for data consistency
- Proper indexing for performance
- Connection pooling

## 🧪 Testing

### Available Test Scripts
```bash
# Test authentication flow
npm run test-auth

# Test comedian management
npm run test-comedian-management

# Test show management
npm run test-show-management

# Test image uploads
npm run test-image-upload

# Test organizer verification
npm run test-organizer-verification

# Comprehensive verification scripts
./test-auth.sh
./test-comedian-management.sh
./test-cp4-cp8-verification.sh
./test-final-verification.sh
./test-image-upload.sh
./test-media-handling.sh
./test-organizer-verification.sh
./test-show-management.sh

# Run all tests
npm run test-all
```

### Test Coverage
- Authentication flows
- CRUD operations
- File uploads
- Role-based access control
- API endpoint testing

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

### Code Review Checklist
- [ ] TypeScript types are correct
- [ ] Database migrations included if needed
- [ ] Tests pass for new functionality
- [ ] Documentation is updated
- [ ] No console.log statements in production code

## 📝 API Documentation

### Authentication Endpoints
- `GET /api/auth/signin` - Custom sign-in page
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/session` - Get current session

### Shows Endpoints
- `GET /api/shows` - List all shows (public)
- `POST /api/shows` - Create new show (organizer only)
- `GET /api/shows/[id]` - Get show details (Public)
- `PUT /api/shows/[id]` - Update show (Owner/Admin only)
- `DELETE /api/shows/[id]` - Delete show (Owner/Admin only)
- `POST /api/bookings` - Create booking (Direct, payment-free)
- `GET /api/bookings` - List user's personal bookings

### Admin Endpoints
- `GET /api/admin/check-session` - Check admin authentication session
- `POST /api/admin/login` - Admin password authentication
- `POST /api/admin/logout` - Admin session logout
- `POST /api/admin/setup-password` - Initial admin password setup
- `GET /api/admin/organizers` - List organizers
- `POST /api/admin/organizers/[id]/approve` - Approve organizer
- `GET /api/admin/comedians` - List comedians with creator info
- `GET /api/admin/users` - List all users

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
- [Razorpay](https://razorpay.com/) - Payment gateway

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the documentation first
- Review existing issues for similar problems

---

**Note**: This README is maintained to help both AI agents and human developers understand and contribute to the Comedy Connect project effectively.
