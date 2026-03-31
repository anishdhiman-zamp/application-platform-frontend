---
description: Convention for React useEffect hooks — extract logic into named functions
paths:
  - '**/*.ts'
  - '**/*.tsx'
---

# useEffect: Extract Logic Into Named Functions

When a `useEffect` contains more than a single statement (beyond the cleanup return), extract the logic into a separate named function (wrapped in `useCallback`) and call it from the effect.

```tsx
// ❌ BAD — inline multi-statement logic in useEffect
useEffect(() => {
  const payload = data.payload;
  const id = payload?.id as string;
  if (!id) return;
  setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...payload } : item)));
}, [data]);

// ✅ GOOD — extracted into a named handler
const handleUpdate = useCallback((data: EventPayload) => {
  const payload = data.payload;
  const id = payload?.id as string;
  if (!id) return;
  setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...payload } : item)));
}, []);

useEffect(() => {
  handleUpdate(data);
}, [data, handleUpdate]);
```

Single-statement effects (e.g. a simple subscription) are fine inline:

```tsx
// ✅ OK — single statement
useEffect(() => {
  const sub = eventBus.subscribe(topic, handler);
  return () => sub.unsubscribe();
}, [eventBus, handler]);
```
