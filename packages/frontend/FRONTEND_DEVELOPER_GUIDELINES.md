# Frontend Developer Guidelines

**Comedy Connect Frontend Development Standards**  
Version: 1.0  
Last Updated: January 30, 2026

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Type Safety & TypeScript](#type-safety--typescript)
3. [Error Handling](#error-handling)
4. [API Communication](#api-communication)
5. [Component Patterns](#component-patterns)
6. [State Management](#state-management)
7. [Performance Optimization](#performance-optimization)
8. [Security Best Practices](#security-best-practices)
9. [Code Quality & Formatting](#code-quality--formatting)
10. [Styling Guidelines](#styling-guidelines)
11. [Testing Standards](#testing-standards)
12. [Accessibility](#accessibility)
13. [File Organization](#file-organization)
14. [Git & Version Control](#git--version-control)

---

## Architecture Overview

### Technology Stack

- **Framework:** Next.js 14+ (App Router)
- **React:** v19.2.3
- **TypeScript:** v5+
- **Styling:** TailwindCSS v4 + CSS Variables
- **Data Fetching:** SWR
- **Authentication:** NextAuth.js v4
- **UI Components:** Radix UI + shadcn/ui
- **State Management:** React Hooks + SWR Cache

### Directory Structure

```
packages/frontend/
├── app/                    # Next.js App Router pages
│   ├── (routes)/          # Route groups
│   ├── api/               # API routes (if needed)
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── [feature]/        # Feature-specific components
├── lib/                   # Utilities and configurations
│   ├── api/              # API client
│   ├── hooks/            # Custom React hooks
│   ├── errors.ts         # Error handling utilities
│   └── utils.ts          # General utilities
├── middleware.ts          # Next.js middleware
├── next.config.ts         # Next.js configuration
└── tailwind.config.ts     # Tailwind configuration
```

### Architectural Principles

1. **Separation of Concerns:** Keep business logic, UI, and data fetching separate
2. **Component Composition:** Build complex UIs from simple, reusable components
3. **Type Safety First:** Leverage TypeScript for compile-time error detection
4. **Server-First:** Use Server Components by default, Client Components when needed
5. **Progressive Enhancement:** Build features that work without JavaScript, enhance with it

---

## Type Safety & TypeScript

### ✅ DO

```typescript
// Use shared types from @comedy-connect/types
import { ShowResponse, UserRole } from '@comedy-connect/types';

// Define explicit return types for functions
function getShowTitle(show: ShowResponse): string {
  return show.title;
}

// Use enums for constants
if (user.role === UserRole.ADMIN) {
  // ...
}

// Extend backend types properly with documentation
/**
 * Extended user type that matches the backend session response.
 * Backend enriches base User with additional fields.
 */
export interface ExtendedUser extends NonNullable<SessionResponse['user']> {
  onboardingCompleted?: boolean;
  phone?: string;
  comedianProfile?: {
    stageName: string;
  };
}
```

### ❌ DON'T

```typescript
// Don't use 'any'
const data: any = await fetchData(); // ❌

// Don't use unsafe type assertions without documentation
const user = data as User; // ❌

// Don't redefine backend types
interface Show { // ❌ Use ShowResponse from types package
  title: string;
  // ...
}

// Don't use magic strings
if (user.role === 'ADMIN') { // ❌ Use UserRole.ADMIN
  // ...
}
```

### Type Safety Rules

1. **No `any` types** - Use `unknown` if type is truly unknown, then narrow it
2. **No `as any` casts** - If you need a cast, document why
3. **Use shared types** - Import from `@comedy-connect/types`, don't redefine
4. **Explicit return types** - Always specify return types for exported functions
5. **Null safety** - Use optional chaining (`?.`) and nullish coalescing (`??`)

---

## Error Handling

### Error Infrastructure

We use a custom `ApiError` class for structured error handling:

```typescript
import { ApiError, normalizeError } from '@/lib/errors';

try {
  const data = await api.get<ShowResponse>('/api/v1/shows/123');
} catch (error) {
  if (error instanceof ApiError) {
    if (error.isNotFound()) {
      // Handle 404
    } else if (error.isUnauthorized()) {
      // Handle 401
    }
    
    // Get user-friendly message
    const message = error.getUserMessage();
    toast.error(message);
  }
}
```

### Error Handling Best Practices

1. **Use normalizeError()** in hooks to convert errors to strings
2. **Show user-friendly messages** - Don't expose technical details
3. **Log errors appropriately** - Use `console.error` in development
4. **Handle network errors** - Account for offline scenarios
5. **Use Error Boundaries** - Wrap route segments in `<ErrorBoundary>`

### Error Boundary Usage

```tsx
'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function FeatureLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<CustomErrorFallback />}
      onError={(error, errorInfo) => {
        // Optional: Send to error tracking service
        console.error('Feature error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

---

## API Communication

### API Client Usage

Always use the centralized API client:

```typescript
import { api } from '@/lib/api/client';

// GET request
const shows = await api.get<{ shows: ShowResponse[] }>('/api/v1/shows');

// POST request
const booking = await api.post<{ booking: BookingResponse }>(
  '/api/v1/bookings',
  { showId: '123', quantity: 2 }
);

// PATCH request
const updated = await api.patch<{ show: ShowResponse }>(
  '/api/v1/shows/123',
  { isPublished: true }
);

// DELETE request
await api.delete('/api/v1/shows/123');
```

### Custom Hooks for Data Fetching

```typescript
import useSWR from 'swr';
import { api } from '@/lib/api/client';
import { normalizeError } from '@/lib/errors';

export function useFeatureData(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/v1/feature/${id}` : null,
    (url: string) => api.get<FeatureResponse>(url)
  );

  return {
    data: data?.feature,
    isLoading,
    error: normalizeError(error),
    mutate,
  };
}
```

### API Guidelines

1. **Type all responses** - Use TypeScript generics with api methods
2. **Handle loading states** - Always show loading UI
3. **Handle errors gracefully** - Use try-catch or error state from SWR
4. **Use SWR for GET requests** - Automatic caching and revalidation
5. **Mutate cache after mutations** - Call `mutate()` after POST/PATCH/DELETE
6. **Avoid request waterfalls** - Fetch data in parallel when possible

---

## Component Patterns

### Server vs Client Components

```tsx
// ✅ Server Component (default)
// app/shows/page.tsx
export default async function ShowsPage() {
  const shows = await fetch('/api/v1/shows').then(r => r.json());
  
  return <ShowsList shows={shows} />;
}

// ✅ Client Component (when needed)
// components/BookingForm.tsx
'use client';

import { useState } from 'react';

export function BookingForm({ showId }: { showId: string }) {
  const [quantity, setQuantity] = useState(1);
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Interactive form */}
    </form>
  );
}
```

### When to Use Client Components

- Interactive event handlers (`onClick`, `onChange`, etc.)
- React hooks (`useState`, `useEffect`, custom hooks)
- Browser APIs (localStorage, window, etc.)
- Third-party libraries that use React hooks

### Component Structure

```tsx
'use client'; // Only if needed

import { useState, useCallback, useMemo } from 'react';
import { SomeType } from '@comedy-connect/types';

// 1. Type definitions
interface ComponentProps {
  data: SomeType;
  onAction?: (id: string) => void;
}

// 2. Component definition with JSDoc
/**
 * Brief description of what this component does.
 * 
 * @param data - Description of data prop
 * @param onAction - Optional callback when action occurs
 */
export function MyComponent({ data, onAction }: ComponentProps) {
  // 3. Hooks (in order: useState, useReducer, useContext, etc.)
  const [state, setState] = useState(false);
  
  // 4. Memoized values
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue(data);
  }, [data]);
  
  // 5. Callbacks
  const handleClick = useCallback(() => {
    onAction?.(data.id);
  }, [onAction, data.id]);
  
  // 6. Effects (if any)
  useEffect(() => {
    // Side effects
  }, []);
  
  // 7. Early returns
  if (!data) return null;
  
  // 8. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

---

## State Management

### State Management Hierarchy

1. **URL State** - Search params, route params (best for shareable state)
2. **Server State** - SWR cache (API data)
3. **Component State** - `useState` (local UI state)
4. **Context** - `useContext` (cross-component state, use sparingly)

### SWR for Server State

```typescript
// ✅ Preferred pattern
export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<SessionResponse>(
    '/api/auth/session',
    () => api.get<SessionResponse>('/api/auth/session')
  );
  
  return {
    user: data?.user as ExtendedUser | null,
    isLoading,
    error: normalizeError(error),
    refetch: mutate,
  };
}
```

### Local State Guidelines

1. **Keep state close to where it's used** - Don't lift state unnecessarily
2. **Use URL for shareable state** - Filters, pagination, selections
3. **Derive state when possible** - Don't duplicate data in state
4. **Use reducers for complex state** - Multiple related state values

---

## Performance Optimization

### Memoization

```tsx
'use client';

import { useMemo, useCallback } from 'react';

export function ExpensiveComponent({ data }: Props) {
  // ✅ Memoize expensive computations
  const processedData = useMemo(() => {
    return data.map(item => expensiveTransform(item));
  }, [data]);
  
  // ✅ Memoize callbacks passed to children
  const handleClick = useCallback((id: string) => {
    // Handle click
  }, []);
  
  // ✅ Memoize static arrays/objects
  const options = useMemo(() => [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ], []);
  
  return <div>{/* UI */}</div>;
}
```

### Image Optimization

```tsx
import Image from 'next/image';

// ✅ Always use Next.js Image component
<Image
  src={show.posterImageUrl}
  alt={show.title}
  width={400}
  height={600}
  priority={isAboveTheFold}
  placeholder="blur"
  blurDataURL={show.blurDataUrl}
/>

// ❌ Don't use regular img tags for remote images
<img src={show.posterImageUrl} alt={show.title} /> // ❌
```

### Bundle Size

```bash
# Analyze bundle size
npm run analyze

# Check for large dependencies before installing
npx bundle-phobia <package-name>
```

### Performance Checklist

- [ ] Use `useMemo` for expensive computations
- [ ] Use `useCallback` for callbacks passed to children
- [ ] Lazy load components with `next/dynamic`
- [ ] Use Next.js `<Image>` component for all images
- [ ] Implement pagination for large lists
- [ ] Use Server Components when possible
- [ ] Avoid unnecessary re-renders (check with React DevTools)

---

## Security Best Practices

### Content Security Policy

CSP headers are configured in `next.config.ts`:

```typescript
// Development: Allows localhost connections
// Production: Strict same-origin policy
connect-src 'self' ${isDev ? 'http://localhost:* ws://localhost:*' : ''}
```

**Never modify CSP without security review.**

### Environment Variables

```bash
# ✅ Public variables (exposed to browser)
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# ❌ Never expose secrets to client
# These should ONLY be used in Server Components/API routes
NEXTAUTH_SECRET=...
DATABASE_URL=...
```

### Authentication

```tsx
// ✅ Check auth in middleware for protected routes
// middleware.ts handles authentication redirects

// ✅ Verify permissions in components
const { user, isAdmin } = useAuth();

if (!isAdmin) {
  return <AccessDenied />;
}
```

### Security Checklist

- [ ] Never commit `.env` files
- [ ] Use `NEXT_PUBLIC_` prefix only for truly public variables
- [ ] Sanitize user input before rendering
- [ ] Validate data from external sources
- [ ] Use HTTPS in production
- [ ] Keep dependencies updated (`npm audit`)
- [ ] Never expose sensitive data in error messages

---

## Code Quality & Formatting

### Prettier

Code is automatically formatted with Prettier:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

**Prettier Configuration** (`.prettierrc`):
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### ESLint

```bash
# Run linter
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Pre-commit Hooks

`lint-staged` runs on commit:
- ESLint with auto-fix
- Prettier formatting

### Code Review Standards

**Before submitting a PR:**
1. Run `npm run format`
2. Run `npm run lint`
3. Run `npx tsc --noEmit`
4. Test manually
5. Write descriptive commit messages

---

## Styling Guidelines

### TailwindCSS Best Practices

```tsx
// ✅ Use semantic class names
<div className="flex items-center gap-4 p-6 bg-card rounded-lg">

// ✅ Extract repeated patterns to components
<Card className="p-6">
  <CardHeader>...</CardHeader>
</Card>

// ✅ Use CSS variables for theme colors
<div className="bg-primary text-primary-foreground">

// ❌ Don't use arbitrary values unless necessary
<div className="p-[13px]"> // ❌ Use p-3 or p-4

// ❌ Don't use inline styles
<div style={{ padding: '1rem' }}> // ❌
```

### Design System

**Color Palette:**
- Primary: `#F5A623` (Vintage Amber)
- Use `--color-theme-primary` CSS variable
- All colors defined in `globals.css`

**Spacing:**
- Use TailwindCSS spacing scale (0-96)
- Consistent padding: `p-4`, `p-6`, `p-8`

**Typography:**
- Font: Geist Sans (primary), Geist Mono (code)
- Use Tailwind typography classes

---

## Testing Standards

*Note: Testing infrastructure is planned but not yet implemented.*

### Future Testing Strategy

1. **Unit Tests** - Utility functions, hooks
2. **Integration Tests** - Component interactions
3. **E2E Tests** - Critical user flows (auth, booking, payment)

### When Tests Are Added

```typescript
// Example: Testing a custom hook
import { renderHook } from '@testing-library/react';
import { useAuth } from '@/lib/hooks';

describe('useAuth', () => {
  it('returns authenticated user', async () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

---

## Accessibility

### Semantic HTML

```tsx
// ✅ Use semantic elements
<nav>
  <ul>
    <li><a href="/shows">Shows</a></li>
  </ul>
</nav>

<main>
  <h1>Page Title</h1>
  <article>...</article>
</main>

// ❌ Don't use divs for everything
<div onClick={...}>Click me</div> // ❌ Use <button>
```

### ARIA Attributes

```tsx
// ✅ Add ARIA labels for screen readers
<button aria-label="Close dialog">
  <X className="w-4 h-4" />
</button>

<img src="..." alt="Comedy show poster featuring John Doe" />

<input aria-describedby="email-hint" />
<p id="email-hint">We'll never share your email</p>
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Logical tab order
- Visible focus indicators
- Support Escape key for modals/dialogs

### Accessibility Checklist

- [ ] All images have `alt` text
- [ ] Form inputs have labels
- [ ] Buttons have descriptive text or `aria-label`
- [ ] Color contrast meets WCAG AA standards
- [ ] Test with keyboard navigation
- [ ] Test with screen reader (VoiceOver, NVDA)

---

## File Organization

### Naming Conventions

- **Components:** PascalCase (`UserProfile.tsx`)
- **Utilities:** camelCase (`formatDate.ts`)
- **Hooks:** camelCase with `use` prefix (`useAuth.ts`)
- **Types:** PascalCase (`UserRole`)
- **Constants:** UPPER_SNAKE_CASE or camelCase

### Import Order

```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party imports
import { toast } from 'sonner';

// 3. Shared types
import { ShowResponse } from '@comedy-connect/types';

// 4. Internal imports (alphabetical)
import { api } from '@/lib/api/client';
import { useAuth } from '@/lib/hooks';
import { Card } from '@/components/ui/card';
```

### File Size

- Keep files under 300 lines
- Split large components into smaller sub-components
- Extract utility functions to separate files

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npx tsc --noEmit         # Type check

# Analysis
npm run analyze          # Analyze bundle size
```

### Key Files

- [`lib/api/client.ts`](./lib/api/client.ts) - API client
- [`lib/errors.ts`](./lib/errors.ts) - Error handling
- [`lib/hooks/index.ts`](./lib/hooks/index.ts) - Custom hooks
- [`middleware.ts`](./middleware.ts) - Auth middleware
- [`next.config.ts`](./next.config.ts) - Next.js config

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

## Getting Help

1. **Check Documentation** - Review this guide and system design docs
2. **Code Search** - Look for similar patterns in the codebase
3. **Ask Team** - Reach out in team chat
4. **Review PRs** - Learn from recent pull requests

---

**Remember:** These guidelines exist to maintain code quality and developer productivity. When in doubt, prioritize:
1. **Type Safety** - Catch errors at compile time
2. **User Experience** - Fast, accessible, intuitive UI
3. **Maintainability** - Clean, documented, testable code
4. **Security** - Never compromise on security

*Last updated: January 30, 2026*
