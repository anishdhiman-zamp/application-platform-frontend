# Battalion

A resource management library for React that provides **optimistic updates**, **automatic rollback**, **transaction API integration**, and **live sync with OPFS caching**.

Built on top of [TanStack Query](https://tanstack.com/query) and [Zod](https://zod.dev).

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Resources](#resources)
  - [useResource Hook](#useresource-hook)
  - [Transactions](#transactions)
  - [Optimistic Updates](#optimistic-updates)
  - [Rollback](#rollback)
  - [Live Sync](#live-sync)
  - [OPFS Caching](#opfs-caching)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Architecture](#architecture)

---

## Features

| Feature                   | Description                                 |
| ------------------------- | ------------------------------------------- |
| **Optimistic Updates**    | UI updates instantly before server response |
| **Automatic Rollback**    | Reverts changes automatically on failure    |
| **Transaction API**       | Fire-and-forget mutations with retry logic  |
| **IndexedDB Persistence** | Pending transactions survive page refresh   |
| **Live Sync**             | Polling or SSE for real-time data           |
| **OPFS Caching**          | Instant page loads from browser cache       |
| **Type Safety**           | Full TypeScript + Zod validation            |

---

## Installation

```bash
npm install @zamp-platform/battalion
# or
pnpm add @zamp-platform/battalion
```

**Peer Dependencies:**

- `react` ^19
- `react-dom` ^19
- `@tanstack/react-query` ^5.0.0
- `zod` ^3.22.0

---

## Quick Start

### 1. Define a Resource

Create a resource definition file:

```typescript
// resources/todo.resource.ts
import { defineResource } from '@zamp-platform/battalion';
import { z } from 'zod';

// Define schema with Zod
const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  completed: z.boolean(),
  created_at: z.string(),
});

export type Todo = z.infer<typeof TodoSchema>;

export const TodoResource = defineResource({
  name: 'Todo',
  schema: TodoSchema,

  // API endpoints
  endpoints: {
    list: 'todos/list',
  },

  // Transaction configuration
  transactions: {
    create: 'create_todo',
    update: 'update_todo',
    delete: 'delete_todo',
    resourceType: 'todo',
    idField: 'id',

    optimistic: {
      create: 'append',
      update: 'merge',
      delete: 'remove',
      getOptimisticItem: (data: Partial<Todo>): Todo => ({
        id: data.id || `temp-${Date.now()}`,
        title: data.title || '',
        completed: data.completed ?? false,
        created_at: new Date().toISOString(),
      }),
    },
  },
});
```

### 2. Import Resource to Register

```typescript
// resources/index.ts
export { type Todo, TodoResource } from './todo.resource';
```

### 3. Use in Component

```typescript
'use client';

import { useResource } from '@zamp-platform/battalion';
import type { Todo } from './resources';

// Import to register resource
import './resources';

function TodoList() {
  const {
    data: todos,
    isLoading,
    error,
    create,
    update,
    delete: deleteTodo,
    transactions,
    errors,
    refetch,
  } = useResource<Todo>('Todo');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {/* Show pending indicator */}
      {transactions.hasPending && <span>Saving...</span>}

      {/* Show failed transactions */}
      {errors.failedTransactions.length > 0 && (
        <div className="error">
          {errors.failedTransactions.map(tx => (
            <p key={tx.id}>Failed: {tx.error.message}</p>
          ))}
        </div>
      )}

      {/* Create new todo */}
      <button onClick={() => create({ title: 'New Todo', completed: false })}>
        Add Todo
      </button>

      {/* List todos */}
      {todos?.map(todo => (
        <div key={todo.id}>
          <span>{todo.title}</span>
          <button onClick={() => update(todo.id, { completed: !todo.completed })}>
            Toggle
          </button>
          <button onClick={() => deleteTodo(todo.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## Core Concepts

### Resources

A **Resource** defines everything about an entity: schema, API endpoints, transaction types, and behaviors.

```typescript
const MyResource = defineResource({
  name: 'MyResource',           // Unique identifier
  schema: MySchema,             // Zod schema for validation
  endpoints: { ... },           // API endpoints
  transactions: { ... },        // Transaction configuration
  liveSync: { ... },            // Optional: live sync config
  cache: { ... },               // Optional: cache config
  relations: { ... },           // Optional: resource relationships
});
```

#### Complete Resource Configuration

```typescript
import { defineResource } from '@zamp-platform/battalion';
import { z } from 'zod';

const PageSchema = z.object({
  page_id: z.string(),
  name: z.string(),
  description: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

type Page = z.infer<typeof PageSchema>;

export const PageResource = defineResource({
  name: 'Page',
  schema: PageSchema,

  // API Endpoints
  endpoints: {
    list: 'pages/get-pages', // GET - fetch all
    get: 'pages/:id', // GET - fetch one (optional)
    create: 'pages', // POST - create (optional, uses transactions)
    update: 'pages/:id', // PUT - update (optional, uses transactions)
    delete: 'pages/:id', // DELETE - delete (optional, uses transactions)
  },

  // Transaction Configuration
  transactions: {
    create: 'create_page', // Transaction type for create
    update: 'update_page', // Transaction type for update
    delete: 'delete_page', // Transaction type for delete
    resourceType: 'page', // Resource type sent to backend
    idField: 'page_id', // Field name for unique ID (default: 'id')

    // Optimistic update behavior
    optimistic: {
      create: 'append', // 'append' | 'prepend'
      update: 'merge', // 'merge' | 'replace'
      delete: 'remove', // 'remove' | 'hide'

      // Create full item for optimistic updates
      getOptimisticItem: (data: Partial<Page>): Page => ({
        page_id: data.page_id || `temp-${Date.now()}`,
        name: data.name || '',
        description: data.description || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    },

    // Rollback handlers (called on failure)
    onRollback: {
      create: (data, error) => {
        console.error('Create failed:', error.message);
        // Show toast notification, etc.
      },
      update: (id, data, error) => {
        console.error(`Update ${id} failed:`, error.message);
      },
      delete: (id, error) => {
        console.error(`Delete ${id} failed:`, error.message);
      },
    },

    // Transform payload before sending (optional)
    transformPayload: {
      create: (data) => ({ ...data, source: 'web' }),
      update: (data) => data,
      delete: (data) => data,
    },

    // Retry configuration
    retry: {
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
    },
  },

  // Live Sync Configuration (optional)
  liveSync: {
    enabled: true,
    strategy: 'polling', // 'polling' | 'sse'
    interval: 120000, // Poll every 2 minutes
    endpoint: '/api/events/pages', // For SSE strategy
    persist: true, // Enable OPFS caching
    persistMaxAge: 24 * 60 * 60 * 1000, // Cache valid for 24 hours
  },

  // Cache Configuration (optional)
  cache: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  // Relations (optional)
  relations: {
    hasMany: ['Sheet'],
    belongsTo: ['Organization'],
  },
});
```

---

### useResource Hook

The main hook for interacting with resources:

```typescript
const {
  // Data & Loading States
  data,                    // T[] | undefined - The resource data
  isLoading,               // boolean - Initial loading
  isFetching,              // boolean - Any fetch in progress
  isStale,                 // boolean - Data is stale
  error,                   // Error | null - Fetch error

  // CRUD Operations
  create,                  // (data: Partial<T>) => void
  update,                  // (id: string, data: Partial<T>) => void
  delete,                  // (id: string) => void
  batch,                   // (operations: BatchOperation[]) => void

  // Mutation States
  isCreating,              // boolean
  isUpdating,              // boolean
  isDeleting,              // boolean

  // Transaction State
  transactions: {
    pending,               // number - Count of pending transactions
    pendingIds,            // string[] - IDs of pending items
    hasPending,            // boolean - Any pending transactions?
    retrying,              // number - Count of retrying transactions
    failed,                // number - Count of failed transactions
  },

  // Error State
  errors: {
    lastError,             // Error | null - Most recent error
    failedTransactions,    // FailedTransaction[] - All failed transactions
  },

  // Live Sync State
  sync: {
    isConnected,           // boolean - Is polling/SSE active?
    lastSyncAt,            // Date | null - Last successful sync
    loadedFromCache,       // boolean - Was data from OPFS cache?
    isSyncing,             // boolean - Sync in progress?
    error,                 // Error | undefined - Sync error
  },

  // Actions
  refetch,                 // () => void - Force refresh from server
  invalidate,              // () => void - Mark data as stale
  getDependency,           // <D>(name: string) => D | undefined
} = useResource<MyType>('MyResource', options);
```

#### Options

```typescript
interface ResourceOptions {
  enabled?: boolean; // Enable/disable fetching (default: true)
  staleTime?: number; // Override cache staleTime
  gcTime?: number; // Override cache gcTime
  queryClient?: QueryClient; // Custom query client
}
```

---

### Transactions

Battalion uses a **fire-and-forget** transaction pattern:

```
User Action → Optimistic Update → Store in IndexedDB → Send to API
     ↓              ↓                    ↓                 ↓
  Instant      UI Updates           Survives         Background
  Feedback     Immediately         Page Refresh       Processing
```

#### How Transactions Work

1. **User triggers action** (create/update/delete)
2. **Optimistic update** applied immediately to UI
3. **Transaction stored** in IndexedDB (survives refresh)
4. **API request sent** in background
5. **On success**: Transaction deleted from IndexedDB
6. **On failure**: Rollback + retry with exponential backoff

#### Transaction Client Configuration

```typescript
import { transactionStore } from '@zamp-platform/battalion';

// Configure before using resources
transactionStore.configure({
  baseUrl: 'https://api.example.com',
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoffMultiplier: 2,
  getAuthHeaders: () => ({
    Authorization: `Bearer ${getToken()}`,
  }),
  getOrganizationId: () => getCurrentOrgId(),
});
```

Or use the provider:

```typescript
import { TransactionProvider } from '@zamp-platform/battalion';

function App({ children }) {
  return (
    <TransactionProvider
      config={{
        baseUrl: 'https://api.example.com',
        getAuthHeaders: () => ({ 'Authorization': `Bearer ${token}` }),
      }}
    >
      {children}
    </TransactionProvider>
  );
}
```

---

### Optimistic Updates

Optimistic updates make the UI feel instant by updating before the server responds.

#### Configuration Options

| Option              | Values                    | Description                             |
| ------------------- | ------------------------- | --------------------------------------- |
| `create`            | `'append'` \| `'prepend'` | Where to add new items                  |
| `update`            | `'merge'` \| `'replace'`  | How to update items                     |
| `delete`            | `'remove'` \| `'hide'`    | How to handle deletes                   |
| `getOptimisticItem` | `(data) => T`             | Create full item for optimistic display |

#### Example

```typescript
optimistic: {
  create: 'prepend',  // New items appear at top
  update: 'merge',    // Merge partial updates
  delete: 'remove',   // Remove immediately

  getOptimisticItem: (data: Partial<Todo>): Todo => ({
    id: data.id || `temp-${Date.now()}`,
    title: data.title || 'Untitled',
    completed: data.completed ?? false,
    created_at: new Date().toISOString(),
  }),
}
```

---

### Rollback

When a transaction fails, Battalion automatically:

1. **Reverts the optimistic update** (restores previous state)
2. **Calls your rollback handler** (for notifications, logging)
3. **Tracks the failure** (accessible via `errors.failedTransactions`)

#### Rollback Flow

```
┌────────────────────────────────────────────────────────────────────┐
│  1. onMutate: Save snapshot, apply optimistic update               │
│     previous = currentData                                         │
│     cache = [...currentData, newItem]  ← UI updates instantly      │
└────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  2. mutationFn: Send transaction to backend                        │
└────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
               SUCCESS              FAILURE
                    │                   │
                    ▼                   ▼
┌──────────────────────────┐  ┌──────────────────────────────────────┐
│  Keep optimistic update  │  │  3. onError: ROLLBACK                │
│                          │  │     cache = previous  ← UI reverts   │
│                          │  │     handleRollback()  ← Track error  │
│                          │  │     onRollback.create() ← Your code  │
└──────────────────────────┘  └──────────────────────────────────────┘
```

#### Handling Failed Transactions

```typescript
function MyComponent() {
  const { errors } = useResource<Todo>('Todo');

  return (
    <>
      {errors.failedTransactions.map(tx => (
        <div key={tx.id} className="error-banner">
          <p>
            Failed to {tx.action} at {tx.timestamp.toLocaleString()}
          </p>
          <p>Error: {tx.error.message}</p>
          <pre>{JSON.stringify(tx.data, null, 2)}</pre>
        </div>
      ))}
    </>
  );
}
```

---

### Live Sync

Live Sync keeps data fresh automatically using **polling** or **SSE**.

#### Polling Strategy

```typescript
liveSync: {
  enabled: true,
  strategy: 'polling',
  interval: 60000,  // Refresh every 60 seconds
}
```

- Fetches data at regular intervals
- Good for data that changes occasionally
- Works everywhere, no special server setup

#### SSE Strategy

```typescript
liveSync: {
  enabled: true,
  strategy: 'sse',
  endpoint: '/api/events/todos',
}
```

- Real-time updates via Server-Sent Events
- Good for collaborative/live features
- Requires SSE endpoint on server
- Auto-reconnects on connection loss

#### Sync State in UI

```typescript
function SyncIndicator() {
  const { sync } = useResource<Todo>('Todo');

  return (
    <div>
      {sync.loadedFromCache && (
        <span>📦 From cache • Last synced {formatTime(sync.lastSyncAt)}</span>
      )}
      {sync.isSyncing && <span>🔄 Syncing...</span>}
      {sync.isConnected && !sync.isSyncing && <span>✓ Live</span>}
      {sync.error && <span>⚠ {sync.error.message}</span>}
    </div>
  );
}
```

---

### OPFS Caching

**OPFS (Origin Private File System)** provides instant page loads by caching data in the browser.

#### How It Works

```
First Visit:
  User opens page → Fetch from server → Save to OPFS → Display

Return Visit:
  User opens page → Load from OPFS (instant!) → Display cached
                  → Fetch fresh in background → Update display
```

#### Configuration

```typescript
liveSync: {
  enabled: true,
  strategy: 'polling',
  persist: true,                        // Enable OPFS
  persistMaxAge: 24 * 60 * 60 * 1000,   // Cache valid for 24 hours
}
```

#### Benefits

- **Instant page loads** - No loading spinner on return visits
- **Offline resilience** - Shows cached data even offline
- **Automatic freshness** - Background sync updates cache

---

## API Reference

### Exports

```typescript
// Core
export { defineResource, getResource } from './core/resource';
export { getResourceRegistry, resetResourceRegistry } from './core/registry';

// Hooks
export { useResource, useMetaState } from './hooks';

// Transactions
export { transactionStore } from './transactions/store';
export { TransactionProvider } from './transactions/provider';

// Live Sync
export { getLiveSyncManager, resetLiveSyncManager } from './core/live-sync';
export { getOPFSStorage, resetOPFSStorage } from './core/opfs-storage';

// Types
export type {
  Resource,
  ResourceConfig,
  ResourceHookReturn,
  TransactionConfig,
  OptimisticConfig,
  LiveSyncConfig,
  CacheConfig,
  BatchOperation,
  FailedTransaction,
  TransactionState,
  ErrorState,
  LiveSyncState,
} from './types';
```

### Type Definitions

```typescript
interface FailedTransaction {
  id: string;
  action: 'create' | 'update' | 'delete';
  data: unknown;
  error: Error;
  timestamp: Date;
  resourceName: string;
}

interface BatchOperation {
  action: 'create' | 'update' | 'delete';
  data: Record<string, unknown>;
  id?: string;
}
```

---

## Examples

### Basic CRUD

```typescript
function TodoApp() {
  const { data: todos, create, update, delete: del } = useResource<Todo>('Todo');

  return (
    <div>
      <button onClick={() => create({ title: 'New', completed: false })}>
        Add
      </button>

      {todos?.map(todo => (
        <div key={todo.id}>
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => update(todo.id, { completed: !todo.completed })}
          />
          <span>{todo.title}</span>
          <button onClick={() => del(todo.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
```

### Batch Operations

```typescript
function BulkActions() {
  const { batch, data: todos } = useResource<Todo>('Todo');

  const markAllComplete = () => {
    batch(
      todos?.map(todo => ({
        action: 'update' as const,
        id: todo.id,
        data: { completed: true },
      })) || []
    );
  };

  const deleteCompleted = () => {
    batch(
      todos
        ?.filter(t => t.completed)
        .map(todo => ({
          action: 'delete' as const,
          id: todo.id,
          data: {},
        })) || []
    );
  };

  return (
    <>
      <button onClick={markAllComplete}>Complete All</button>
      <button onClick={deleteCompleted}>Clear Completed</button>
    </>
  );
}
```

### Error Handling UI

```typescript
function ErrorBanner() {
  const { errors } = useResource<Todo>('Todo');

  if (errors.failedTransactions.length === 0) return null;

  return (
    <div className="bg-red-100 border border-red-400 p-4 rounded">
      <h3 className="font-bold text-red-800">Some changes failed to save</h3>
      {errors.failedTransactions.map(tx => (
        <div key={tx.id} className="mt-2">
          <p className="text-red-700">
            {tx.action} failed: {tx.error.message}
          </p>
        </div>
      ))}
    </div>
  );
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Your Component                                  │
│                                    │                                         │
│                           useResource<T>('Name')                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          ▼                          ▼                          ▼
┌──────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  React Query     │    │  Transaction Store   │    │  Live Sync Manager   │
│  (Data Fetching) │    │  (Mutations)         │    │  (Auto Refresh)      │
└──────────────────┘    └──────────────────────┘    └──────────────────────┘
          │                          │                          │
          │                          ▼                          ▼
          │             ┌──────────────────────┐    ┌──────────────────────┐
          │             │  IndexedDB           │    │  OPFS Storage        │
          │             │  (Pending Txns)      │    │  (Data Cache)        │
          │             └──────────────────────┘    └──────────────────────┘
          │                          │
          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Backend API                                     │
│                    (REST endpoints + Transaction API)                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## License

MIT
