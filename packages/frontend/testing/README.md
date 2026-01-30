# Frontend Testing Guide

This directory contains all frontend tests for Comedy Connect.

## 📋 Overview

The frontend testing infrastructure uses Vitest + React Testing Library and follows a comprehensive approach:
- **Component Tests**: Test React components in isolation
- **Hook Tests**: Test custom React hooks
- **Page Tests**: Test full page rendering and interactions
- **Accessibility Tests**: Ensure WCAG compliance

## 🏗️ Structure

```
packages/frontend/testing/
├── components/              # Component unit tests
│   ├── shows/              # Show-related components
│   ├── ui/                 # UI library components
│   └── admin/              # Admin components
├── hooks/                  # Custom hooks tests
├── pages/                  # Page-level integration tests
├── a11y/                   # Accessibility tests
├── mocks/                  # MSW handlers and data
│   ├── handlers/           # API handlers by feature
│   ├── data/               # Mock data fixtures
│   ├── handlers.ts         # Legacy (use handlers/ instead)
│   └── server.ts           # MSW server setup
├── utils/                  # Test utilities
│   ├── render.tsx          # Custom render with providers
│   ├── mock-router.tsx     # Next.js router mock
│   └── test-utils.ts       # Helper functions
├── setup.ts               # Global test setup
└── README.md              # This file
```

## 🚀 Running Tests

```bash
# Run all frontend tests
npm run test

# Run in watch mode
npm run test:watch

# Run specific test file
npm run test show-card.test.tsx

# Run with UI
npm run test:ui

# Coverage report
npm run test:coverage
```

## ✅ Test Categories

### Component Tests (`components/`)

**Purpose**: Test React components in isolation with user interactions.

**Example**:
```typescript
import { render, screen } from '../utils/render';
import userEvent from '@testing-library/user-event';
import { ShowCard } from '@/components/shows/show-card';

describe('ShowCard', () => {
    it('should display show information', () => {
        render(<ShowCard show={mockShow} />);
        
        expect(screen.getByText(mockShow.title)).toBeInTheDocument();
    });

    it('should handle click', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(<ShowCard show={mockShow} onClick={onClick} />);
        
        await user.click(screen.getByRole('article'));
        expect(onClick).toHaveBeenCalled();
    });
});
```

### Hook Tests (`hooks/`)

**Purpose**: Test custom React hooks with state management.

**Example**:
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useShows } from '@/lib/hooks/use-shows';

describe('useShows', () => {
    it('should fetch shows', async () => {
        const { result } = renderHook(() => useShows());

        await waitFor(() => {
            expect(result.current.shows).toBeDefined();
        });
    });
});
```

### Page Tests (`pages/`)

**Purpose**: Test full page components with mocked APIs.

**Example**:
```typescript
import { render, screen, waitFor } from '../utils/render';
import { ShowsPage } from '@/app/shows/page';

describe('Shows Page', () => {
    it('should display shows list', async () => {
        render(<ShowsPage />);

        await waitFor(() => {
            expect(screen.getByText('Show Title')).toBeInTheDocument();
        });
    });
});
```

### Accessibility Tests (`a11y/`)

**Purpose**: Validate WCAG compliance using jest-axe.

**Example**:
```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Component A11y', () => {
    it('should have no violations', async () => {
        const { container } = render(<Component />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
```

## 🛠️ Test Utilities

### Custom Render (`utils/render.tsx`)

Wraps components with necessary providers (SWR, etc.):

```typescript
import { render } from '../utils/render'; // Use this instead of @testing-library/react

render(<MyComponent />);
```

### Mock Router (`utils/mock-router.tsx`)

Mocks Next.js navigation:

```typescript
import { mockRouter } from '../utils/mock-router';

// Router is automatically mocked
// Access mock methods:
expect(mockRouter.push).toHaveBeenCalledWith('/shows');
```

### Helper Functions (`utils/test-utils.ts`)

```typescript
import { wait, createMockFile, generateTestId } from '../utils/test-utils';

await wait(100);
const file = createMockFile('poster.jpg');
const id = generateTestId();
```

## 🎭 MSW Mocking

### Using Handlers

All API endpoints are mocked by default:

```typescript
// Handlers are set up in setup.ts
// Override for specific tests:
server.use(
    http.get('*/api/v1/shows', () => {
        return HttpResponse.json({ shows: customShows });
    })
);
```

### Mock Data

```typescript
import { mockShows, mockBookings } from '../mocks/data';

const shows = mockShows(); // Returns array of 3 shows
const singleShow = mockShows()[0];
```

## 📝 Writing New Tests

### Component Test Template

```typescript
import { render, screen } from '../utils/render';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '@/components/my-component';

describe('MyComponent', () => {
    it('should render', () => {
        render(<MyComponent />);
        expect(screen.getByRole('...')).toBeInTheDocument();
    });

    it('should handle interaction', async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();

        render(<MyComponent onClick={onClick} />);
        
        await user.click(screen.getByRole('button'));
        expect(onClick).toHaveBeenCalled();
    });
});
```

### Best Practices

✅ **DO**:
- Use semantic queries (`getByRole`, `getByLabelText`)
- Test user behavior, not implementation
- Use `userEvent` for interactions
- Reset MSW handlers in `beforeEach`
- Test loading and error states
- Use custom render with providers

❌ **DON'T**:
- Query by class names or test IDs (use semantic queries)
- Test component internals (state, props)
- Use `waitFor` without specific conditions
- Share state between tests
- Mock too much (test real behavior)

## 🐛 Debugging

```bash
# Run with debug output
npm run test -- --reporter=verbose

# Run single test in watch mode
npm run test:watch -- show-card.test.tsx

# Use debugging utilities
import { screen } from '@testing-library/react';
screen.debug(); // Prints DOM
```

## 📊 Coverage

```bash
npm run test:coverage
open coverage/index.html
```

**Coverage Targets**:
- Components: >80%
- Hooks: >90%
- Overall: >80%

## 🔍 Common Issues

### MSW Not Intercepting Requests

**Problem**: API calls go through to real backend

**Solution**: Ensure MSW server is set up in `setup.ts` and handlers are defined

### SWR Cache Issues

**Problem**: Tests fail due to cached data

**Solution**: Use custom render which provides fresh SWR cache per test

### Async Issues

**Problem**: Tests fail with "not wrapped in act()"

**Solution**: Use `waitFor` and `userEvent` properly, avoid direct state updates

## 🔗 Related Documentation

- [Main Testing Guide](../../../docs/TESTING.md)
- [Backend Testing](../../backend/testing/README.md)
- [E2E Testing](../../../testing/e2e/README.md)
