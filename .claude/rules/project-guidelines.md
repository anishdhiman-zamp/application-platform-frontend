---
description: Project-wide coding standards, component architecture, styling, and TypeScript conventions
---

Prompt Generation Rules:

- Analyze the component requirements thoroughly
- Include specific shadcn-ui and radix-ui component suggestions
- Any new generic component should be added in packages/ui
- Specify desired Tailwind CSS classes for styling and read variables from tailwind.config.ts
- Mention any required TypeScript types or interfaces
- Include instructions for responsive design
- Suggest appropriate Next.js features if applicable and especially the ones to improve performance
- Specify any necessary state management or hooks
- Include accessibility considerations
- Mention any required icons or assets
- Suggest error handling and loading states
- Include instructions for animations or transitions if needed
- For animations requirement use framer-motion which is renamed as motion
- Refer the docs of motion at https://motion.dev/docs/react-animation for any new animation requirements
- Specify any required API integrations or data fetching
- Mention performance optimization techniques if applicable
- Include instructions for testing the component and for a new component always create a test case file
- Suggest documentation requirements for the component

## Styling and components

### TailwindCSS Rules:

- Use TailwindCSS utility classes for styling
- Avoid custom CSS unless absolutely necessary
- Maintain consistent order of utility classes
- Use Tailwind's responsive variants for adaptive designs
- Leverage Shadcn-UI components for rapid development and create them in packages/ui
- Customise only when absolutely necessary
- Define and use design tokens in packages/ui/tailwind.config.ts

## CI and CD

### Development Process:

- Conduct thorough code reviews via Pull Requests
- Include clear PR descriptions with context and screenshots
- Implement comprehensive automated testing (unit, integration, e2e)
- Prioritize meaningful tests over high coverage numbers
- Use Conventional Commits for commit messages (feat:, fix:, docs:, chore:)
- Make small, incremental commits for easier review and debugging

## Code Style and Structure

### General Principles

- Write concise, readable TypeScript code
- Use functional and declarative programming patterns
- Follow DRY (Don't Repeat Yourself) principle
- Implement early returns for better readability
- Structure components logically: exports, subcomponents, helpers, types
- General presentational components should be created in packages/ui
- Prioritize reusability and modularity
- Ensure consistent naming conventions
- Follow React best practices and patterns
- Implement proper prop validation
- Consider internationalization requirements
- Optimize for SEO when applicable

### Naming Conventions

- Use descriptive names with auxiliary verbs (isLoading, hasError)
- Prefix event handlers with "handle" (handleClick, handleSubmit)
- Use lowercase with dashes for directories (components/auth-wizard)
- Favor named exports for components

### Next Usage

- Use dynamic routes with bracket notation ([id].tsx)
- Validate and sanitize route parameters
- Prefer flat, descriptive routes
- Use getServerSideProps for dynamic data, getStaticProps/getStaticPaths for static
- Implement Incremental Static Regeneration (ISR) where appropriate
- Use next/image for optimized images
- Configure image layout, priority, sizes, and srcSet attributes

### API data fetching and global state management

- Use features of RTK query to cache data and invalidate cache when needed

### React Context Pattern

- Use the reducer-based context pattern from `apps/application-dashboard/src/components/filter/filters.context.tsx` as the reference for any new React Context module
- Shape of a context module:
  - An `enum` of action type keys (e.g. `fooContextActions`) — keys are SCREAMING_SNAKE_CASE and their string values match the key
  - An `InitialStateType` interface and an `initialState` constant
  - An exported `ActionType` interface: `{ type: keyof typeof fooContextActions; payload?: ... }`
  - A `createContext` call typed with `{ state: InitialStateType; dispatch: Dispatch<ActionType> }` plus any stable helper callbacks
  - A `StateProvider` component that uses `useReducer` and a `switch` over `action.type`; guard against `undefined` action and return `state` in the `default` case
  - A `withFooContext` HOC that wraps a component in `StateProvider`
  - A `useFooContextStore` hook returning `useContext(context)`
  - Named exports: the actions enum, the hook, and the HOC
- Wrap any side-effect-producing callbacks exposed via the context value in `useCallback` so consumers that pass them to `useEffect` / `useCallback` deps do not re-run on every provider render
- Use this pattern even for small contexts — it keeps state transitions auditable and mirrors the rest of the codebase

### TypeScript Usage

- Use TypeScript for all code
- Prefer interfaces over types
- Avoid enums; use const maps instead
- Implement proper type safety and inference
- Use `satisfies` operator for type validation
- Enable all strict mode options in tsconfig.json
- Explicitly type all variables, parameters, and return values
- Use utility types, mapped types, and conditional types
- Prefer 'interface' for extendable object shapes
- Use 'type' for unions, intersections, and primitive compositions
- Document complex types with JSDoc
- Avoid ambiguous union types, use discriminated unions when necessary

## React 19 and Next.js 15 Best Practices

### Component Architecture

- Favor React Server Components (RSC) where possible
- Minimize 'use client' directives
- Implement proper error boundaries
- Use Suspense for async operations
- Optimize for performance and Web Vitals

### Component Internal Structure

Follow this order within React components and custom hooks for consistency and readability:

1. **State** - useState, useRef declarations
2. **Derived State** - useMemo, computed values, context values
3. **Hooks** - Custom hooks (useFileActions, useFileClipboard, etc.), RTK Query hooks, mutations
4. **Handlers** - useCallback wrapped event handlers (and any useCallback wrappers used by effects)
5. **Effects** - useEffect / useLayoutEffect. Always at the bottom, just before render.
6. **Render** - Early returns, JSX

If Derived State depends on the output of a Hook (e.g. `useMemo` over `data` from `useGetXQuery`), the Hooks block may come before Derived State — keep all hooks grouped together, and always keep Effects last.

```typescript
const MyComponent = ({ prop1, prop2 }: Props) => {
  // State
  const [value, setValue] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Derived State
  const computedValue = useMemo(() => /* ... */, [dep]);
  const { contextValue } = useMyContext();

  // Hooks
  const { action1, action2 } = useMyCustomHook({ /* ... */ });

  // Handlers
  const handleClick = useCallback(() => { /* ... */ }, []);

  const syncSomething = useCallback(() => { /* effect logic */ }, [dep]);

  // Effects
  useEffect(() => {
    syncSomething();
  }, [syncSomething]);

  // Render
  if (loading) return <Spinner />;

  return <div>...</div>;
};
```

- Memoize handlers with useCallback when passed to child components
- Group related props into objects (state, handlers, etc.) for cleaner APIs
- Extract complex logic into custom hooks for reusability and testability

### Function Prop Types

Never write `() => void` inline for callback props — use the shared `defaultFnType` alias from `@/types/commonTypes`.

```ts
// ❌ Bad
interface Props {
  onClose: () => void;
}

// ✅ Good
import type { defaultFnType } from '@/types/commonTypes';
interface Props {
  onClose: defaultFnType;
}
```

For callbacks that take arguments or return a value, write the signature inline (no shared alias).

### Defensive Programming

- **Always early-return on null / undefined inputs.** Any function (component, hook, util) that accepts a value which could be `null` / `undefined` must guard at the top with an early return. Don't let `undefined` flow into downstream logic.
- **Add null/optional-chain guards everywhere.** Use `?.`, `??`, and explicit `if (!x) return ...` checks even when the type system says non-nullable — API/runtime data can still be missing. Guards have no cost and prevent crashes.
- **Hooks must return constants (data + handlers), never a wrapper function.** A custom hook's return value should be an object of named state, derived values, and callbacks that consumers can destructure. Do not return a single function as the hook's whole result.

```ts
// ❌ Bad — no guard, hook returns a function
const useFoo = (id: string) => {
  return () => {
    api.fetch(id).then(/* ... */);
  };
};

// ✅ Good — early return, hook returns named handlers/state
const useFoo = (id: string | null) => {
  if (!id) return { isReady: false, handleFetch: noop };

  const handleFetch = useCallback(() => api.fetch(id), [id]);
  return { isReady: true, handleFetch };
};
```

### Don't Reach for `useCallback` By Default

Don't wrap every handler in `useCallback`. React Compiler is enabled in this repo (`reactCompiler: true`) and auto-memoizes inline handlers — explicit `useCallback` only adds noise.

Use `useCallback` only when:

1. The function is a **dependency of another hook** (`useEffect`, `useMemo`, `useCallback`).
2. The function is passed to a **`React.memo`'d child** where referential stability matters.
3. The function is **part of a custom hook's public return** API.

Otherwise, write a regular inline function. Same goes for `useMemo` — only memoize genuinely expensive computations or references consumed by other hooks' deps.

```tsx
// ❌ Avoid
const handleClick = useCallback(() => setOpen(true), []);

// ✅ Prefer
const handleClick = () => setOpen(true);
```

This narrows the older "memoize handlers with useCallback when passed to child components" guidance — that rule predated React Compiler. Today, prefer plain functions and reach for `useCallback` only when one of the three conditions above genuinely applies.

### Async Flow: Prefer `.then()/.catch()` Over `try/catch`

For promise-returning calls (RTK Query mutations, `fetch`, API calls), prefer the `.then().catch()` chain over `async/await` wrapped in `try/catch`. Reads as a linear success/failure flow and pairs naturally with `.unwrap()`.

```ts
// ❌ Avoid
const handleSave = async () => {
  try {
    await updateCredential(payload).unwrap();
    toast.success('Saved');
    onClose();
  } catch {
    toast.error('Failed to save');
  }
};

// ✅ Prefer
const handleSave = () => {
  updateCredential(payload)
    .unwrap()
    .then(() => {
      toast.success('Saved');
      onClose();
    })
    .catch(() => {
      toast.error('Failed to save');
    });
};
```

`async/await` + `try/catch` remains acceptable when coordinating multiple sequential awaits inline; for a single mutation + side effect, default to the chain form.

### Pure Functions Live in `utils` (and Are Tested)

- **Every pure function belongs in the module's `utils` file** (`src/modules/<feature>/utils/<feature>.utils.ts`), not inline in a component or hook.
- A function is "pure" if it has no side effects — no `useState`/`setState`, no API calls, no `toast`, no DOM access. If it just transforms inputs into outputs, it's a util.
- This includes factories, mappers, validators, formatters, and reducers — regardless of how many args they take.
- `useCallback`-wrapped closures that read component state are **not** pure; leave those inline as handlers.
- **Every pure function must have unit tests.** Place tests at `src/modules/<feature>/__tests__/<feature>.utils.test.ts` — the `__tests__` folder lives at the module root, not inside `utils/`. Cover happy path + edge cases (empty inputs, null/undefined, boundaries).

```ts
// ✅ utils file
export const credentialKeysToBody = (keys: CredentialKeyType[]): Record<string, string> => /* ... */;

// ✅ src/modules/credentials-vault/__tests__/credentials-vault.utils.test.ts
describe('credentialKeysToBody', () => {
  it('skips empty rows', () => { /* ... */ });
});
```

### Type / Interface Naming & Placement

- **Always end type/interface names with the `Type` suffix** (e.g. `CredentialResponseType`, `WidgetDataType`). Bare names like `Credential` or `User` are not allowed for types.
- **Co-locate types in the module's `types/` folder.** Feature types: `src/modules/<feature>/types/<feature>.types.ts`. API types: `src/types/api/<domain>.types.ts`. Don't declare exported types inline at the top of component files — only purely-private single-file inline interfaces may stay inline.
- **Props interfaces** keep the `Props` suffix without doubling up to `PropsType`.

### Skeleton Components

- **Skeletons live in a dedicated `skeletons/` folder per module**: `src/modules/<feature>/skeletons/<Name>Skeleton.tsx`. Never declare skeleton components inline at the top of feature components.
- **Extract any cluster of inline `<Skeleton />` blocks into a named component** the moment it's used; name it with the `Skeleton` suffix.
- **Repeated rows take a `rowCount` prop** so callers size the skeleton to expected data length. Default to a sensible value (e.g. `3`).
- **Skeleton prop types are exempt from the "move types to `types/`" rule.** Declare the props interface inline in the skeleton file itself (still suffixed with `Type`). Skeletons are leaf presentational components.

```tsx
// ✅ Good — src/modules/credentials-vault/skeletons/CredentialDialogSkeleton.tsx
interface CredentialDialogSkeletonPropsType {
  rowCount?: number;
}

const CredentialDialogSkeleton = ({ rowCount = 2 }: CredentialDialogSkeletonPropsType) => (
  <div className='flex flex-col gap-6'>
    {Array.from({ length: rowCount }).map((_, idx) => (
      <Skeleton key={idx} className='h-10 w-full' />
    ))}
  </div>
);
```

### Class Composition with `cn`

Always use `cn` from `@zamp-platform/ui/utils` for any dynamic className composition. Never use template strings, string concatenation, or `&& 'class-name'` short-circuits — they don't dedupe Tailwind utilities and they break the Tailwind class-sort plugin.

```tsx
// ❌ Bad
<div className={`flex items-center ${isActive ? 'bg-blue-500' : 'bg-gray-100'}`} />
<div className={'flex' + (disabled && ' opacity-50')} />

// ✅ Good
<div className={cn('flex items-center', isActive ? 'bg-blue-500' : 'bg-gray-100')} />
<div className={cn('flex', disabled && 'opacity-50')} />
```

Static-only class strings may stay as plain literals; use `cn` the moment any condition or variable is involved.

### State Management

- Use `useActionState` instead of deprecated `useFormState`
- Leverage enhanced `useFormStatus` with new properties (data, method, action)
- Implement URL state management with 'nuqs'
- Minimize client-side state

### Async Request APIs

```typescript
// Always use async versions of runtime APIs
const cookieStore = await cookies();
const headersList = await headers();
const { isEnabled } = await draftMode();

// Handle async params in layouts/pages
const params = await props.params;
const searchParams = await props.searchParams;
```
