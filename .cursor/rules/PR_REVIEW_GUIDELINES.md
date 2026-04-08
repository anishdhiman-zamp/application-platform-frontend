# PR Review Guidelines - Zamp Application Platform Frontend

## Overview

This document is a working bible for review PRs. Some practices are general practices, while some are opinated basis our problem statements and what will work best for Zamp.
_When in doubt, follow this blindly._

## Table of Contents

1. [Code Quality & Standards](#code-quality--standards)
2. [Design Patterns Guidelines](#design-patterns-guidelines)
3. [TypeScript Conventions](#typescript-conventions)
4. [Component Architecture](#component-architecture)
5. [API & State Management](#api--state-management)
6. [Styling & UI Guidelines](#styling--ui-guidelines)
7. [Testing Requirements](#testing-requirements)
8. [File Structure & Naming](#file-structure--naming)
9. [Performance Considerations](#performance-considerations)

## Code Quality & Standards

### TypeScript Usage

- **Strict Mode Required**: All TypeScript must use strict mode with proper type safety
- **Interfaces Over Types**: Use `interface` declarations over `type` aliases for object shapes
- **No `any` Types**: Avoid `any` types; use proper type definitions or generic constraints
- **Discriminated Unions**: Use discriminated unions for widget types and API responses

```typescript
// ✅ Good - Discriminated union
export type WidgetInstanceType =
  | LineBarChartWidgetInstanceType
  | PieDonutChartWidgetInstanceType
  | PivotTableWidgetInstanceType
  | KPITagWidgetInstanceType;

// ❌ Bad - Using any
const widgetData: any = response.data;
```

### Enum Usage

- **Const Enums Preferred**: Use const enums for better tree-shaking
- **String Enums**: Use string enums for API-facing values
- **Consistent Naming**: Use SCREAMING_SNAKE_CASE for enum values

```typescript
// ✅ Good
const enum WIDGET_TYPES {
  BAR_CHART = 'bar_chart',
  LINE_CHART = 'line_chart',
  PIE_CHART = 'pie_chart',
}

// ❌ Bad
enum widgetTypes {
  barChart = 'bar_chart',
}
```

## Design Patterns Guidelines

### React Design Patterns

#### Custom Hook Pattern

- **Convention**: All custom hooks must use the `use` prefix
- **Implementation**: Encapsulate stateful logic and side effects
- **Examples**: `useWindowDimensions`, `useAppSelector`, `useLastVisitedPage`

```typescript
// ✅ Good - Custom hook with proper naming and encapsulation
const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Implementation logic
  }, []);

  return dimensions;
};

// ❌ Bad - Missing 'use' prefix
const getWindowDimensions = () => {
  /* ... */
};
```

#### Provider Pattern

- **Usage**: Wrap components with context providers for state management
- **Implementation**: Use nested provider composition for complex state
- **Best Practice**: Keep providers focused on single responsibilities

```typescript
// ✅ Good - Nested provider composition
<QueryClientProvider client={queryClient}>
  <Provider store={store}>
    <ThemeProvider>
      {children}
    </ThemeProvider>
  </Provider>
</QueryClientProvider>
```

#### Compound Component Pattern

- **Usage**: Create flexible, composable UI components
- **Implementation**: Use context to share state between compound components
- **Examples**: Dialog (Header, Body, Footer), Form components

```typescript
// ✅ Good - Compound component structure
<Dialog>
  <DialogHeader>
    <DialogTitle>Confirmation</DialogTitle>
  </DialogHeader>
  <DialogContent>
    <DialogDescription>Are you sure?</DialogDescription>
  </DialogContent>
  <DialogFooter>
    <Button>Cancel</Button>
    <Button>Confirm</Button>
  </DialogFooter>
</Dialog>
```

#### Render Props Pattern

- Avoid this as it is not optimised for react instead use compound and composition pattern

### Component Architecture Patterns

#### Variant Pattern

- **Usage**: Use `cva` (class variance authority) for component styling variants
- **Implementation**: Define variants with consistent naming and behavior
- **Best Practice**: Support size, color, and state variants

```typescript
// ✅ Good - Variant pattern with cva
const buttonVariants = cva('inline-flex items-center justify-center rounded-md text-sm font-medium', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent',
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});
```

#### Observer Pattern

- **Usage**: Use Intersection and Resize observers for UI interactions
- **Implementation**: Clean up observers in useEffect cleanup
- **Examples**: Lazy loading, scroll-based animations, responsive behavior

```typescript
// ✅ Good - Observer pattern with proper cleanup
useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Handle intersection
      }
    });
  });

  if (elementRef.current) {
    observer.observe(elementRef.current);
  }

  return () => observer.disconnect();
}, []);
```

#### Forwarding Pattern

- **Usage**: Use `forwardRef` for component composition and ref access
- **Implementation**: Forward refs to underlying DOM elements
- **Best Practice**: Combine with TypeScript for proper typing

```typescript
// ✅ Good - Ref forwarding with TypeScript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

### State Management Patterns

#### Redux Toolkit Query Pattern

- **Usage**: Centralized API state management with caching
- **Implementation**: Use tags for cache invalidation
- **Best Practice**: Transform responses consistently

```typescript
// ✅ Good - RTK Query with proper caching and transformation
getUserById: builder.query<User, string>({
  query: (id) => `/users/${id}`,
  providesTags: (result, error, id) => [{ type: 'User', id }],
  transformResponse: (response: ApiResponse<User>) => response.data,
}),
```

#### Selector Pattern

- **Usage**: Use selectors for derived state and memoization
- **Implementation**: Create reusable selectors with proper memoization
- **Best Practice**: Use `createSelector` for complex computations

```typescript
// ✅ Good - Memoized selectors
const selectUserById = createSelector([selectUsers, (state, userId) => userId], (users, userId) =>
  users.find((user) => user.id === userId),
);
```

### Anti-Patterns to Avoid

#### React Anti-Patterns

```typescript
// ❌ Bad - Prop drilling instead of context
<ComponentA data={data} />
  <ComponentB data={data} />
    <ComponentC data={data} />

// ❌ Bad - Missing dependency arrays
useEffect(() => {
  fetchData();
}); // Missing dependency array

// ❌ Bad - Inline object creation
<Component style={{ margin: 10 }} />
```

#### API Anti-Patterns

```typescript
// ❌ Bad - Manual cache management
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(false);

// ❌ Bad - Inconsistent error handling
try {
  const data = await api.getUsers();
} catch (error) {
  // Inconsistent error handling
}
```

#### Component Anti-Patterns

```typescript
// ❌ Bad - Massive component with multiple responsibilities
const MassiveComponent = () => {
  // 500+ lines of mixed concerns
};

// ❌ Bad - Missing prop types
const Component = ({ data }) => {
  // No TypeScript interface
};
```

## TypeScript Conventions

### Interface Definitions

- **Extend Base Interfaces**: Use inheritance for common patterns
- **Optional Properties**: Use `?` for optional properties, not `| undefined`
- **Generic Constraints**: Use proper generic constraints for reusable types

```typescript
// ✅ Good - Base interface with extensions
export interface WidgetInstanceBaseType {
  widget_instance_id: string;
  widget_id: string;
  sheet_id: string;
  title: string;
  dataset_id: string;
  created_at: string;
  updated_at: string;
  display_config?: MapAny;
}

export interface LineBarChartWidgetInstanceType extends WidgetInstanceBaseType {
  widget_type: WIDGET_TYPES.BAR_CHART | WIDGET_TYPES.LINE_CHART;
  data_mappings: {
    version: string;
    datasets: { id: string }[];
    mappings: BarLineChartWidgetMapping[];
  };
}
```

### Type Naming Conventions

- **Suffix with Type**: End type definitions with `Type` (e.g., `WidgetDataType`)
- **Props Interfaces**: End component prop interfaces with `Props`
- **API Types**: Group API-related types in dedicated files under `types/api/`

## Next.js Specific Guidelines

### App Router & Server Components

- **Use Next.js 15 App Router** with proper route organization in `src/app/`
- **Implement async Server Components** for data fetching at the route level
- Use `'use client'` directive only when necessary for interactivity (treat this as one of your currency, be extremely frugal)
- Leverage Server Components wherever possible
- Implement proper loading.tsx and error.tsx files for route segments
- Use group routes for common layout between two routes
- Use parallel routes for modals

### Navigation & Routing Patterns

- **Use Next.js navigation hooks** appropriately:
  - `useRouter()` for programmatic navigation
  - `useParams()` for dynamic route parameters
    - Instead of using `useParams()` in server side components you can make the component async and await params
  - `useSearchParams()` for query string handling
    - Generally try to avoid this
- Avoid using #fragment based routing
- Implement proper redirect patterns using `redirect()` from `next/navigation`
- Use dynamic routes with proper param validation and type safety
- Handle nested routes with proper layout composition

### Performance & Optimization

- After every new feature, analyse the bundle and look for areas of improvements
- Implement code splitting and lazy loading strategies
- Configure proper caching headers
- Use the power of service worker to defer heavy tasks away from main thread

### Layout & Provider Patterns

- **Implement nested layouts** with proper provider wrapping hierarchy
- Use Suspense boundaries for loading states and error boundaries
- Organize providers in `src/app/_providers/` with proper composition
- Implement proper authentication guards in layout components

### Next.js Best Practices

```typescript
// ✅ Proper async Server Component
export default async function Page({ params }: { params: { id: string } }) {
  const data = await fetchData(params.id);

  return (
    <Suspense fallback={<Loading />}>
      <DataComponent data={data} />
    </Suspense>
  );
}

// ✅ Proper client component usage
'use client';
export function InteractiveComponent() {
  const router = useRouter();
  const params = useParams();

  return <div onClick={() => router.push('/new-route')} />;
}
```

## Component Architecture

### Component Structure

- **Functional Components**: Use functional components with hooks
- **Props Interface**: Always define explicit props interfaces

```typescript
// ✅ Good - Component with proper interface
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
    // Component implementation
  },
);

Button.displayName = 'Button';
```

### Component Organization

- **Shared Components**: Generic components must go in `packages/ui`
- **Feature Components**: Feature-specific components in respective module directories
- **Layout Components**: Layout components in `components/layouts/`

### Hooks Usage

- **Custom Hooks**: Extract complex logic into custom hooks and put them in `packages/utils/hooks`
- **Hook Naming**: Start custom hooks with `use` prefix
- **Dependencies**: Be explicit about hook dependencies

```typescript
// ✅ Good - Custom hook
export const useResourceAccess = (resourceType: ResourceType, resourceId: string) => {
  const { data: accessData, isLoading } = useGetResourceAccessQuery({
    resourceType,
    resourceId,
  });

  return {
    hasAccess: accessData?.has_access ?? false,
    audienceData: accessData?.audience_data ?? [],
    isLoading,
  };
};
```

## API & State Management

### RTK Query Patterns

- **Centralized API**: All API endpoints in dedicated files under `src/apis/`
- **Query Hooks**: Export and use generated query hooks
- **Transform Response**: Use `transformResponse` for data normalization
- **Cache Tags**: Implement proper cache invalidation with tags

```typescript
// ✅ Good - RTK Query endpoint
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

export const { useGetWidgetInstanceQuery } = Widgets;
```

### State Management

- **Redux Store**: Use Redux for global application state
- **Local State**: Use React state for component-specific state
- **Context**: Use React Context for shared UI state (filters, themes)

## Styling & UI Guidelines

### Tailwind CSS Usage

- **Utility Classes**: Use Tailwind utility classes, avoid custom CSS
- **Class Variance Authority**: Use `cva` for component variants
- **Design Tokens**: Use design system tokens for colors and spacing

```typescript
// ✅ Good - Using cva for variants
const buttonVariants = cva('inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium', {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
    size: {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
    },
  },
});
```

### Color System

- **Design Tokens**: Use predefined color tokens with kebab-case style (e.g., `bg-gray-400` instead of `bg-GRAY_400`)
- **Semantic Colors**: Use semantic color names over hex values
- **Consistent Palette**: Maintain consistency with the established color palette

## Testing Requirements

### Testing Packages

- Write or updatetest cases accordingly
- It should be unit testable with backwards compatibility
- Test component behavior, not implementation details

### Testing Apps

- Feature should be tested manually on dev by the feature owners (BE, FE, Design, Product)
- Write automated test suite for regression
- Post release: Do sanity testing of core features and then your feature

## File Structure & Naming

### Directory Organization

- **Feature Modules**: Organize by feature in `src/modules/`
- **Shared Components**: Common components in `packages/ui/`
- **Type Definitions**: Types in `src/types/` with API types in subdirectories
- **Utilities**: Helper functions in `packages/utils/`

### Naming Conventions

- **PascalCase**: Component files and class names
- **camelCase**: Function names, variable names, and file names for utilities
- **kebab-case**: CSS classes and file names for styles
- **SCREAMING_SNAKE_CASE**: Constants and enum values

```
// ✅ Good - File naming
src/
  components/
    layouts/
      dashboard-layout/
        Sidebar.tsx
        components/
          SidebarTab.tsx
  modules/
    widgets/
      WidgetsWrapper.tsx
      components/
        WidgetOptionDropdown.tsx
  types/
    api/
      widgets.types.ts
  utils/
    common.ts
```

## Performance Considerations

### React Performance

- **Memoization**: Use `useMemo` and `useCallback` for expensive computations
- **Component Splitting**: Split large components into smaller, focused components
- **Lazy Loading**: Use dynamic imports for code splitting
- **Avoid Inline Objects**: Don't create objects in render functions

```typescript
// ✅ Good - Memoized computation
const filteredSidebarItems = useMemo(
  () =>
    SIDEBAR_ITEMS.filter(
      (item) => !item?.isHidden && (item?.id !== 'payments' || (item?.id === 'payments' && paymentConfig?.id)),
    ),
  [paymentConfig],
);
```
