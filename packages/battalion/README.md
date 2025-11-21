# Battalion - A Meta Frontend Framework

Battalion is a meta-framework built on top of Next.js and TanStack Query that makes each UI component state-aware with built-in capabilities for optimistic updates, live sync, prefetching, caching, and declarative data dependencies.

## Features

- **Declarative Resources**: Define data schema, endpoints, and relationships
- **View Composition**: Declarative composition of resources into UI surfaces
- **Query Orchestration**: Automatic dependency resolution and query execution
- **Optimistic Updates**: Built-in optimistic UI updates
- **Live Sync**: Real-time data synchronization
- **Type Safety**: Full TypeScript support with Zod validation
- **Hook-Based**: Simple hooks that work with existing TanStack Query setup

## Installation

```bash
npm install @zamp-platform/battalion
```

## Quick Start

### 1. Define Resources

```tsx
import { z } from 'zod';
import { defineResource } from '@zamp-platform/battalion';

export const PageResource = defineResource({
  name: 'Page',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
  }),
  endpoints: {
    list: '/api/pages',
    create: '/api/pages',
    update: '/api/pages/:id',
    delete: '/api/pages/:id',
  },
  behaviors: {
    optimistic: {
      create: 'append',
      update: 'merge',
      delete: 'remove',
    },
    liveSync: true,
  },
});
```

### 2. Define Views

```tsx
import { defineView } from '@zamp-platform/battalion';

export const DashboardView = defineView({
  name: 'Dashboard',
  uses: [
    { entity: 'Page', alias: 'pages' },
    { entity: 'Sheet', alias: 'sheets', dependsOn: 'pages' },
  ],
});
```

### 3. Use in Components

```tsx
import { useResource, useView } from '@zamp-platform/battalion';

// Using a resource directly
function PageList() {
  const { data: pages, create, isLoading } = useResource('Page');

  return (
    <div>
      <button onClick={() => create({ title: 'New Page' })}>Create Page</button>
      {pages?.map((page) => (
        <div key={page.id}>{page.title}</div>
      ))}
    </div>
  );
}

// Using a view
function Dashboard() {
  const { data, actions, uiState } = useView('Dashboard');

  return (
    <div>
      <h1>Dashboard</h1>
      {uiState.isLoading && <div>Loading...</div>}

      <div>
        <h2>Pages</h2>
        <button onClick={() => actions.createPage({ title: 'New Page' })}>Create Page</button>
        {data.pages?.map((page) => (
          <div key={page.id}>{page.title}</div>
        ))}
      </div>
    </div>
  );
}
```

## Core Concepts

### Resources

Resources define the data schema, API endpoints, and behaviors for entities in your application.

```tsx
const UserResource = defineResource({
  name: 'User',
  schema: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }),
  endpoints: {
    list: '/api/users',
    get: '/api/users/:id',
    create: '/api/users',
    update: '/api/users/:id',
    delete: '/api/users/:id',
  },
  behaviors: {
    optimistic: {
      create: 'append',
      update: 'merge',
      delete: 'remove',
    },
    liveSync: true,
    cache: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
  relations: {
    hasMany: ['Post'],
    belongsTo: ['Organization'],
  },
});
```

### Views

Views compose multiple resources into a cohesive UI surface with automatic dependency resolution.

```tsx
const UserDashboardView = defineView({
  name: 'UserDashboard',
  uses: [
    { entity: 'User', alias: 'currentUser' },
    { entity: 'Post', alias: 'posts', dependsOn: 'currentUser' },
    { entity: 'Comment', alias: 'comments', dependsOn: 'posts', lazy: true },
  ],
});
```

### Hooks

#### useResource

Use a single resource directly:

```tsx
function UserList() {
  const {
    data: users,
    create,
    update,
    delete: deleteUser,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
  } = useResource('User');

  return (
    <div>
      {users?.map((user) => (
        <div key={user.id}>
          {user.name}
          <button onClick={() => update(user.id, { name: 'Updated' })}>Update</button>
          <button onClick={() => deleteUser(user.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

#### useView

Use a view with multiple resources:

```tsx
function Dashboard() {
  const { data, actions, uiState } = useView('Dashboard');

  return (
    <div>
      {uiState.isLoading && <div>Loading...</div>}
      {uiState.hasError && <div>Error: {uiState.errors[0]?.message}</div>}

      <div>
        <h2>Users</h2>
        <button onClick={() => actions.createUser({ name: 'New User' })}>Create User</button>
        {data.users?.map((user) => (
          <div key={user.id}>{user.name}</div>
        ))}
      </div>

      <div>
        <h2>Posts</h2>
        {data.posts?.map((post) => (
          <div key={post.id}>{post.title}</div>
        ))}
      </div>
    </div>
  );
}
```

## Behaviors

### Optimistic Updates

Battalion provides built-in optimistic updates for better user experience:

```tsx
const PostResource = defineResource({
  name: 'Post',
  // ... other config
  behaviors: {
    optimistic: {
      create: 'append', // Add new posts to the end
      update: 'merge', // Merge updates with existing data
      delete: 'remove', // Remove deleted posts immediately
    },
  },
});
```

### Live Sync

Enable real-time synchronization:

```tsx
const MessageResource = defineResource({
  name: 'Message',
  // ... other config
  behaviors: {
    liveSync: true, // Enable live sync
    cache: {
      staleTime: 0, // Always consider data stale for real-time updates
    },
  },
});
```

### Caching

Configure cache behavior:

```tsx
const ProductResource = defineResource({
  name: 'Product',
  // ... other config
  behaviors: {
    cache: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    },
  },
});
```

## Integration with Existing Setup

Battalion works seamlessly with your existing TanStack Query setup:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useResource, useView } from '@zamp-platform/battalion';

// Your existing QueryClient
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your existing components */}
      <Dashboard />
    </QueryClientProvider>
  );
}

// Battalion hooks work with your existing QueryClient
function Dashboard() {
  const { data, actions } = useView('Dashboard', { queryClient });
  // ...
}
```

## Migration from RTK Query

Battalion provides a smooth migration path from RTK Query:

```tsx
// Before (RTK Query)
const { data: pages, isLoading } = useGetPagesQuery();
const [createPage] = useCreatePageMutation();

// After (Battalion)
const { data: pages, create, isLoading } = useResource('Page');
```

## TypeScript Support

Battalion provides full TypeScript support with type inference:

```tsx
// Resource types are inferred from schema
const UserResource = defineResource({
  name: 'User',
  schema: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  // ... other config
});

// Hook return types are inferred
function UserList() {
  const { data, create } = useResource('User');
  // data is typed as User[] | undefined
  // create is typed as (data: Partial<User>) => void
}
```

## Examples

See the `examples/` directory for more comprehensive examples including:

- Basic resource and view usage
- Complex dependency graphs
- Real-time collaboration
- Offline-first applications

## Contributing

Contributions are welcome! Please see our contributing guidelines for more information.

## License

MIT
