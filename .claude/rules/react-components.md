---
paths:
  - 'apps/**/*.{ts,tsx}'
  - 'packages/**/*.{ts,tsx}'
---

# React component authoring rules

These rules apply when working in any `.ts`/`.tsx` file under `apps/` or `packages/`. The root `CLAUDE.md` covers the project-wide conventions; this file covers component-authoring specifics.

## Component internal structure (order)

Within React components and custom hooks, follow this order:

1. **State** — `useState`, `useRef`
2. **Derived state** — `useMemo`, computed values, context
3. **Hooks** — custom hooks, RTK Query hooks, mutations
4. **Handlers** — `useCallback`-wrapped event handlers (and any `useCallback` wrappers used by effects)
5. **Effects** — `useEffect`, `useLayoutEffect`. Always at the bottom, just before render.
6. **Render** — early returns, JSX

If derived state depends on a hook's output (e.g. `useMemo` over `data` from `useGetXQuery`), the hooks block may come before derived state — keep hooks of the same kind grouped, and keep effects last regardless.

## `useEffect` convention

When a `useEffect` has more than a single statement, extract the logic into a named `useCallback` function (in the handlers block) and call it from the effect. Single-statement effects are fine inline.

The `useEffect` block always lives at the bottom of the component/hook body, after handlers and immediately before render — never interleaved with handlers or hooks.

## Don't reach for `useCallback` by default

React Compiler is enabled (`reactCompiler: true` in `next.config`) — inline handlers are auto-memoized. Explicit `useCallback` adds noise without benefit in most cases.

Only use `useCallback` when:

1. The function is a **dependency of another hook** (`useEffect`, `useMemo`, another `useCallback`) — without it, the dependent hook re-runs every render.
2. The function is passed to a **deeply-memoized child** (`React.memo`, `forwardRef + memo`) where referential stability changes behavior.
3. The function is **returned from a custom hook** as part of its public API — consumers depend on a stable identity.

For plain inline `onClick` / `onChange` on an unmemoized component, write a regular function:

```tsx
// ❌ Avoid — useCallback adds noise
const handleClick = useCallback(() => setOpen(true), []);
return <Button onClick={handleClick}>Open</Button>;

// ✅ Prefer
const handleClick = () => setOpen(true);
return <Button onClick={handleClick}>Open</Button>;

// ✅ Also fine — direct inline for one-liners
return <Button onClick={() => setOpen(true)}>Open</Button>;
```

Same principle for `useMemo`: don't wrap a 2-op derivation; only memoize when the computation is genuinely expensive or the reference is consumed by another hook's deps.

## Defensive programming

- **Always early-return on null/undefined inputs.** Any function that accepts a value which could be `null`/`undefined` (props, hook returns, API responses, route params) must guard with an early return at the top. Do not let `undefined` flow through downstream logic.
- **Add null/optional-chain guards across the codebase.** Use `?.`, `??`, and explicit `if (!x) return ...` checks even when the type system says the value is non-nullable — runtime data from APIs, query params, and async sources can still be `undefined`.
- **Hook return values are objects, not functions.** Return `{ state, handlers }` so consumers can destructure. Never `return () => doSomething` as the hook's whole return.

```ts
// ❌ Bad — no guard, hook returns a function
const useFoo = (id: string) => {
  return () => {
    api.fetch(id).then(...);
  };
};

// ✅ Good — early return, named handlers/state
const useFoo = (id: string | null) => {
  if (!id) return { isReady: false, handleFetch: noop };

  const handleFetch = useCallback(() => api.fetch(id), [id]);
  return { isReady: true, handleFetch };
};
```

## Async flow: prefer `.then()/.catch()` over `try/catch`

For promise-returning calls (RTK Query mutations, `fetch`, any API call), prefer the `.then().catch()` chain over `async/await` wrapped in `try/catch`. Reads as a linear success/failure flow, plays nicely with `.unwrap()`, and avoids `await`-inside-guarded-block bugs.

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

`async/await + try/catch` is acceptable when coordinating multiple awaited steps inline (read file → upload → patch metadata). The default for a single mutation + side effect is the chain form.

## Pure functions live in `utils/`

- **Move every pure function out of components/hooks into the module's `utils` file.** A function is "pure" if it has no side effects — no `useState`/`setState`, no API calls, no `toast`, no DOM access. If it just transforms inputs into outputs, it belongs in `src/modules/<feature>/utils/<feature>.utils.ts` (or a shared util file).
- Includes single-arg helpers, multi-arg transformers, factories, mappers, validators, formatters, and reducers.
- Closures over component state extracted into `useCallback` are **not** pure (they read the closure) — leave those as inline handlers.
- **Every pure function in `utils` must have unit tests.** Tests live at `src/modules/<feature>/__tests__/<feature>.utils.test.ts`. The `__tests__` folder mirrors the module root, not the `utils` subfolder. Cover the happy path + edge cases (empty input, null/undefined, boundary values).

```ts
// ✅ Good — pure transformer in utils, fully tested
// src/modules/credentials-vault/utils/credentials-vault.utils.ts
export const credentialKeysToBody = (keys: CredentialKeyType[]): Record<string, string> => /* ... */;

// src/modules/credentials-vault/__tests__/credentials-vault.utils.test.ts
describe('credentialKeysToBody', () => {
  it('skips empty rows', () => { /* ... */ });
  it('trims keys and values', () => { /* ... */ });
});
```

## Skeleton components

- **Each module owns its skeletons in a dedicated `skeletons/` folder**: `src/modules/<feature>/skeletons/<Name>Skeleton.tsx`. Do not declare skeletons inline at the top of feature components.
- **Skeletons are reusable presentational components** — extract any inline `<div>` cluster of `<Skeleton />` blocks into a named component the moment it's used.
- **Repeated rows take a `rowCount` prop** (default `3`) so callers size the skeleton to expected data length.
- Skeleton names end with `Skeleton` (e.g. `CredentialDialogSkeleton`).
- **Skeleton prop types are exempt from the `types/` co-location rule** — declare inline in the skeleton file (still with `Type` suffix).

```tsx
// ✅ src/modules/credentials-vault/skeletons/CredentialDialogSkeleton.tsx
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

## Styling

Always use `cn` from `@zamp-platform/ui/utils` for any className composed from a base + a conditional, an array, or a prop-driven variant. Never concatenate with template strings, ternaries returning `'foo bar'`, or `&& 'class-name'` — these don't dedupe Tailwind classes and break the prettier-plugin-tailwindcss sort.

```tsx
// ❌ Bad
<div className={`flex items-center ${isActive ? 'bg-blue-500' : 'bg-gray-100'}`} />
<div className={'flex' + (disabled && ' opacity-50')} />

// ✅ Good
<div className={cn('flex items-center', isActive ? 'bg-blue-500' : 'bg-gray-100')} />
<div className={cn('flex', disabled && 'opacity-50')} />
```

Static-only classNames may stay as plain string literals.

## Naming

- Event handlers prefixed with `handle` (`handleClick`, `handleSubmit`).
- Boolean variables prefixed with auxiliary verbs (`isLoading`, `hasError`).
- PascalCase components, camelCase functions, SCREAMING_SNAKE_CASE constants/enums.
