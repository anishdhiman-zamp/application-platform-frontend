# GitHub Copilot PR Review Instructions

## Overview

This file provides instructions for GitHub Copilot to assist with PR reviews for the Zamp Application Platform Frontend. Follow these guidelines strictly when reviewing code changes.

> **Important**: This project uses **Next.js 16** with **React 19.2**. Always verify patterns against the latest documentation.

## Code Quality & Standards

### TypeScript Conventions

**Always check for:**
- ✅ Strict TypeScript mode compliance
- ✅ Use of `interface` declarations over `type` aliases for object shapes
- ✅ No `any` types - use proper type definitions or generic constraints
- ✅ Discriminated unions for widget types and API responses
- ✅ Proper interface naming with `Type` suffix (e.g., `WidgetDataType`)
- ✅ Props interfaces ending with `Props`

**Flag issues like:**
```typescript
// ❌ Bad - Using any
const widgetData: any = response.data;

// ❌ Bad - Using type instead of interface for object shapes
type UserProps = {
  name: string;
  email: string;
};
```

### Enum Usage

**Verify:**
- ✅ Const enums for better tree-shaking
- ✅ String enums for API-facing values
- ✅ PascalCase for enum type names
- ✅ snake_case for enum values

**Example of good enum:**
```typescript
// ✅ Good
const enum WIDGET_TYPES {
  BarChart = 'bar_chart',
  LineChart = 'line_chart',
  PieChar = 'pie_chart',
}
```

## Component Architecture

### Component Structure

**Check for:**
- ✅ Functional components with hooks
- ✅ Explicit props interfaces defined
- ✅ Proper use of `React.forwardRef` when needed
- ✅ Components in correct directories:
  - Generic components in `packages/ui`
  - Feature components in respective module directories
  - Layout components in `components/layouts/`

**Flag issues like:**
```typescript
// ❌ Bad - Missing props interface
const Button = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};

// ❌ Bad - Component in wrong location
// Generic Button component should be in packages/ui, not in feature module
```

### Custom Hooks

**Verify:**
- ✅ Custom hooks start with `use` prefix
- ✅ Hooks are placed in `packages/utils/hooks`
- ✅ Proper dependency arrays in useEffect
- ✅ Explicit hook dependencies

## API & State Management

### RTK Query Patterns

**Check for:**
- ✅ API endpoints in dedicated files under `src/apis/`
- ✅ Proper use of `transformResponse` for data normalization
- ✅ Cache tags for invalidation
- ✅ Consistent error handling through RTK Query

**Flag anti-patterns:**
```typescript
// ❌ Bad - Manual cache management
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);

// ❌ Bad - Inconsistent error handling
try {
  const data = await api.getUsers();
} catch (error) {
  // Empty catch block or inconsistent handling
}
```

**Good RTK Query pattern:**
```typescript
// ✅ Good
const Widgets = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWidgetInstance: builder.query<WidgetInstanceResponseType, string>({
      query: (widgetId) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.WIDGET_INSTANCE_GET, { widgetId }),
      }),
      transformResponse: ({ data }) => data,
      providesTags: ['Widget'],
    }),
  }),
});
```

## Next.js 16 Specific Guidelines

### App Router & Server Components

**Verify:**
- ✅ Use of Next.js 16 App Router with Turbopack (default)
- ✅ Async Server Components for data fetching
- ✅ Minimal use of `'use client'` directive
- ✅ Proper loading.tsx and error.tsx files
- ✅ Group routes for common layouts
- ✅ Parallel routes with required `default.js` files
- ✅ Use `proxy.ts` instead of deprecated `middleware.ts`

**Check for:**
```typescript
// ✅ Good - Async Server Component with async params (Next.js 16)
export default async function Page({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params; // params is now a Promise
  const data = await fetchData(slug);
  return <DataComponent data={data} />;
}

// ❌ Bad - Synchronous params access (removed in Next.js 16)
export default async function Page({ params }: { params: { id: string } }) {
  const data = await fetchData(params.id); // Error: params must be awaited
  return <DataComponent data={data} />;
}

// ❌ Bad - Unnecessary client component
'use client';
export function StaticComponent() {
  return <div>Static content</div>;
}
```

### Async Request APIs (Breaking Change in Next.js 16)

**All request APIs are now fully async:**
```typescript
// ✅ Good - Async access (Next.js 16)
const cookieStore = await cookies();
const headersList = await headers();
const { isEnabled } = await draftMode();

// In pages/layouts
const params = await props.params;
const searchParams = await props.searchParams;

// ❌ Bad - Synchronous access (removed in Next.js 16)
const cookieStore = cookies(); // Error
```

### Navigation Patterns

**Verify:**
- ✅ Proper use of Next.js navigation hooks
- ✅ Async params handling in server components (required in Next.js 16)
- ✅ Avoid fragment-based routing
- ✅ Proper redirect patterns
- ✅ Use `PageProps`, `LayoutProps`, `RouteContext` type helpers

### Proxy (formerly Middleware)

**The `middleware` file is deprecated in Next.js 16. Use `proxy` instead:**
```typescript
// ✅ Good - proxy.ts (Next.js 16)
export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url));
}

// ❌ Bad - middleware.ts (deprecated)
export function middleware(request: NextRequest) {
  // ...
}
```

**Config flags renamed:**
- `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`

### Cache Components & `use cache` Directive

**Next.js 16 introduces Cache Components for caching:**
```typescript
// Enable in next.config.ts
const nextConfig: NextConfig = {
  cacheComponents: true,
};

// ✅ Good - Using use cache directive
async function getData() {
  'use cache';
  cacheLife('hours'); // Use built-in profile
  cacheTag('products'); // Tag for invalidation
  return fetch('/api/data');
}

// ✅ Good - Component-level caching
export async function ProductList() {
  'use cache';
  cacheTag('products');
  const products = await fetch('/api/products');
  return <div>{/* render products */}</div>;
}
```

### New Caching APIs (Next.js 16)

**Stable APIs (no more `unstable_` prefix):**
```typescript
// ✅ Good - Next.js 16
import { cacheLife, cacheTag, updateTag, revalidateTag, refresh } from 'next/cache';

// ❌ Bad - Old unstable imports
import { unstable_cacheLife as cacheLife } from 'next/cache';
```

**New `updateTag` for read-your-writes (Server Actions only):**
```typescript
'use server';
import { updateTag } from 'next/cache';

export async function createPost(formData: FormData) {
  await db.post.create({ data: formData });
  updateTag('posts'); // User sees changes immediately
}
```

**New `revalidateTag` with cache profile:**
```typescript
'use server';
import { revalidateTag } from 'next/cache';

export async function updateArticle(articleId: string) {
  revalidateTag(`article-${articleId}`, 'max'); // Stale-while-revalidate
}
```

**New `refresh` for client router refresh:**
```typescript
'use server';
import { refresh } from 'next/cache';

export async function markNotificationAsRead(id: string) {
  await db.notifications.markAsRead(id);
  refresh(); // Refresh client router
}
```

### React 19.2 Features

**New stable APIs:**
```typescript
// ✅ Good - useEffectEvent (stable in React 19.2)
import { useEffectEvent } from 'react';

function Chat({ onMessage }) {
  const onMessageEvent = useEffectEvent(onMessage);
  useEffect(() => {
    connection.on('message', onMessageEvent);
  }, []);
}

// ✅ Good - View Transitions
import { ViewTransition } from 'react';

function Page() {
  return (
    <ViewTransition>
      <Content />
    </ViewTransition>
  );
}
```

### React Compiler Support (Stable)

**Enable automatic memoization:**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  reactCompiler: true, // No longer experimental
};
```

### Turbopack Configuration (Next.js 16)

**Turbopack is now default. Configuration moved from experimental:**
```typescript
// ✅ Good - Next.js 16
const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: { /* ... */ },
  },
};

// ❌ Bad - Next.js 15 (deprecated)
const nextConfig: NextConfig = {
  experimental: {
    turbopack: { /* ... */ },
  },
};
```

### Removed Features in Next.js 16

**Flag these as errors:**
- ❌ AMP support (`useAmp`, `config.amp`)
- ❌ `next lint` command (use ESLint directly)
- ❌ `serverRuntimeConfig` / `publicRuntimeConfig` (use env variables)
- ❌ `experimental.dynamicIO` (use `cacheComponents`)
- ❌ `experimental.ppr` (use `cacheComponents`)
- ❌ `next/legacy/image` (use `next/image`)
- ❌ `images.domains` (use `images.remotePatterns`)

## Styling & UI Guidelines

### Tailwind CSS Usage

**Check for:**
- ✅ Use of Tailwind utility classes
- ✅ Avoid custom CSS unless necessary
- ✅ Use of `cva` for component variants
- ✅ Design tokens for colors and spacing

**Flag issues:**
```typescript
// ❌ Bad - Custom CSS instead of Tailwind
const styles = {
  button: {
    backgroundColor: '#007bff',
    padding: '10px 20px',
  },
};

// ✅ Good - Using cva for variants
const buttonVariants = cva('inline-flex items-center justify-center rounded-md text-sm font-medium', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
  },
});
```

## Performance Considerations

### React Performance

**Check for:**
- ✅ Use of `useMemo` and `useCallback` for expensive computations (or enable React Compiler)
- ✅ Component splitting for large components
- ✅ Avoid inline object creation in render functions
- ✅ Proper dependency arrays
- ✅ Use Server Components to reduce client JS bundle

**Flag performance issues:**
```typescript
// ❌ Bad - Inline object creation
<Component style={{ margin: 10 }} />

// ❌ Bad - Missing dependency array
useEffect(() => {
  fetchData();
});

// ✅ Good - Memoized computation
const filteredItems = useMemo(
  () => items.filter(item => item.isActive),
  [items]
);

// ✅ Better - With React Compiler enabled, manual memoization is often unnecessary
// The compiler auto-memoizes components and values
```

### Next.js 16 Performance Features

**Verify usage of:**
- ✅ Turbopack (default in Next.js 16) for faster builds
- ✅ `use cache` directive for component/function caching
- ✅ Server Components to reduce client bundle size
- ✅ Streaming with Suspense boundaries
- ✅ Enhanced prefetching (layout deduplication, incremental prefetching)

## Import Organization

### Import Sorting

**Verify:**
- ✅ React imports first
- ✅ External libraries next
- ✅ Internal packages (`@zamp-platform/*`)
- ✅ Relative imports last
- ✅ CSS imports at the end

**Example of good import order:**
```typescript
// ✅ Good
import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';

import { useGetPagesQuery } from 'apis/pages';
import { ICON_SPRITE_TYPES } from '@zamp-platform/ui/types';

import CommonWrapper from 'components/commonWrapper';
import SidebarTab from 'components/layouts/dashboard-layout/components/SidebarTab';

import './styles.css';
```

## File Structure & Naming

### Naming Conventions

**Check for:**
- ✅ PascalCase for component files and class names
- ✅ camelCase for function names and variables
- ✅ kebab-case for CSS classes and style files
- ✅ SCREAMING_SNAKE_CASE for constants
- ✅ PascalCase for enum type names
- ✅ snake_case for enum values

### Directory Organization

**Verify:**
- ✅ Feature modules in `src/modules/`
- ✅ Shared components in `packages/ui/`
- ✅ Type definitions in `src/types/` with API types in subdirectories
- ✅ Utilities in `packages/utils/`

## Testing Requirements

### Test Coverage

**Check for:**
- ✅ Test cases for new functionality
- ✅ Component behavior testing (not implementation details)
- ✅ Unit testable with backwards compatibility
- ✅ Manual testing requirements documented

## Security Guidelines

### Data Handling

**Verify:**
- ✅ Input validation implemented
- ✅ No sensitive data in client code
- ✅ Proper authentication checks
- ✅ XSS prevention measures

## Review Checklist

When reviewing PRs, always check:

### Code Quality
- [ ] TypeScript strict mode compliance
- [ ] Proper interface definitions
- [ ] No `any` types used
- [ ] Consistent naming conventions
- [ ] Proper error handling

### Architecture
- [ ] Components in correct directories
- [ ] Proper separation of concerns
- [ ] RTK Query patterns followed
- [ ] State management best practices

### Performance
- [ ] Memoization where appropriate
- [ ] No unnecessary re-renders
- [ ] Proper dependency arrays
- [ ] Bundle size considerations

### Testing
- [ ] Test coverage for new functionality
- [ ] Integration tests for user flows
- [ ] Proper test isolation
- [ ] Meaningful test descriptions

### Security
- [ ] Input validation implemented
- [ ] No sensitive data in client code
- [ ] Proper authentication checks
- [ ] CORS and security headers configured

## Common Issues to Flag

### TypeScript Issues
- Using `any` instead of proper types
- Missing interface definitions
- Incorrect generic usage
- Type assertion overuse
- Not using `PageProps`, `LayoutProps`, `RouteContext` type helpers

### Component Issues
- Missing prop interfaces
- Improper hook usage
- Missing error boundaries
- Performance anti-patterns
- Missing `default.js` in parallel routes

### API Issues
- Missing error handling
- Improper cache invalidation
- Inconsistent response handling
- Missing loading states
- Synchronous access to `cookies()`, `headers()`, `params`, `searchParams`

### Next.js 16 Migration Issues
- Using deprecated `middleware.ts` instead of `proxy.ts`
- Synchronous params/searchParams access
- Using removed features (AMP, `next lint`, runtime config)
- Using `unstable_` prefixed cache APIs
- Using `experimental.turbopack` instead of top-level `turbopack`
- Missing `cacheComponents` flag for `use cache` directive

### Styling Issues
- Custom CSS instead of Tailwind
- Inconsistent spacing/colors
- Missing responsive design
- Accessibility violations

## Enforcement

**Always:**
- Provide specific, actionable feedback
- Reference the relevant section of PR_REVIEW_GUIDELINES.md
- Suggest code examples for fixes
- Check for consistency with existing codebase patterns
- Consider performance implications
- Verify security best practices
- Ensure Next.js 16 patterns are followed (async APIs, proxy, cache components)

**Never:**
- Approve code that violates these guidelines
- Skip reviewing TypeScript types
- Ignore performance implications
- Overlook security concerns
- Accept inconsistent patterns
- Allow deprecated Next.js 15 patterns (sync params, middleware.ts, unstable_ APIs)

Remember: When in doubt, follow the PR_REVIEW_GUIDELINES.md blindly. These guidelines are the working bible for this codebase.

## Version Requirements (Next.js 16)

| Requirement   | Minimum Version |
| ------------- | --------------- |
| Node.js       | 20.9.0 (LTS)    |
| TypeScript    | 5.1.0           |
| Chrome        | 111+            |
| Edge          | 111+            |
| Firefox       | 111+            |
| Safari        | 16.4+           | 