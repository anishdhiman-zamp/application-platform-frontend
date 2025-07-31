# GitHub Copilot PR Review Instructions

## Overview

This file provides instructions for GitHub Copilot to assist with PR reviews for the Zamp Application Platform Frontend. Follow these guidelines strictly when reviewing code changes.

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
- ✅ SCREAMING_SNAKE_CASE for enum values

**Example of good enum:**
```typescript
// ✅ Good
const enum WIDGET_TYPES {
  BAR_CHART = 'bar_chart',
  LINE_CHART = 'line_chart',
  PIE_CHART = 'pie_chart',
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

## Next.js Specific Guidelines

### App Router & Server Components

**Verify:**
- ✅ Use of Next.js 15 App Router
- ✅ Async Server Components for data fetching
- ✅ Minimal use of `'use client'` directive
- ✅ Proper loading.tsx and error.tsx files
- ✅ Group routes for common layouts
- ✅ Parallel routes for modals

**Check for:**
```typescript
// ✅ Good - Async Server Component
export default async function Page({ params }: { params: { id: string } }) {
  const data = await fetchData(params.id);
  return <DataComponent data={data} />;
}

// ❌ Bad - Unnecessary client component
'use client';
export function StaticComponent() {
  return <div>Static content</div>;
}
```

### Navigation Patterns

**Verify:**
- ✅ Proper use of Next.js navigation hooks
- ✅ Async params handling in server components
- ✅ Avoid fragment-based routing
- ✅ Proper redirect patterns

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
- ✅ Use of `useMemo` and `useCallback` for expensive computations
- ✅ Component splitting for large components
- ✅ Avoid inline object creation in render functions
- ✅ Proper dependency arrays

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
```

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
- ✅ SCREAMING_SNAKE_CASE for constants and enum values

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

### Component Issues
- Missing prop interfaces
- Improper hook usage
- Missing error boundaries
- Performance anti-patterns

### API Issues
- Missing error handling
- Improper cache invalidation
- Inconsistent response handling
- Missing loading states

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

**Never:**
- Approve code that violates these guidelines
- Skip reviewing TypeScript types
- Ignore performance implications
- Overlook security concerns
- Accept inconsistent patterns

Remember: When in doubt, follow the PR_REVIEW_GUIDELINES.md blindly. These guidelines are the working bible for this codebase. 