/**
 * Battalion Usage Example
 *
 * This demonstrates the fire-and-forget transaction pattern:
 * - Mutations apply optimistic updates immediately
 * - Transaction is sent to backend (stored in IndexedDB first)
 * - Backend response handled asynchronously (success deletes from IndexedDB, failure retries)
 * - Frontend doesn't wait for response - user sees instant feedback
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { z } from 'zod';

import { defineResource, TransactionProvider, useResource } from '../src';

// ============================================================================
// 1. DEFINE RESOURCES
// ============================================================================

export const PageResource = defineResource({
  name: 'Page',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
  }),
  endpoints: {
    list: '/api/pages',
    get: '/api/pages/:id',
  },
  transactions: {
    create: 'create_page',
    update: 'update_page',
    delete: 'delete_page',
    resourceType: 'page',
    optimistic: {
      create: 'append', // New items appear at end
      update: 'merge', // Fields are merged
      delete: 'remove', // Item is removed from list
    },
    // Called if backend returns 4xx error
    onRollback: {
      create: (data, error) => {
        console.error('Failed to create:', error.message);
        // Show toast, etc.
      },
      update: (id, data, error) => {
        console.error(`Failed to update ${id}:`, error.message);
      },
    },
  },
  cache: {
    staleTime: 5 * 60 * 1000,
  },
});

export const PageMemberResource = defineResource({
  name: 'PageMember',
  schema: z.object({
    id: z.string(),
    userId: z.string(),
    pageId: z.string(),
    role: z.enum(['viewer', 'editor', 'admin']),
  }),
  endpoints: {
    list: '/api/pages/:pageId/members',
  },
  dependsOn: [{ resource: 'Page', extractParams: (page) => ({ pageId: (page as { id: string }).id }) }],
  transactions: {
    create: 'add_page_member',
    update: 'update_member_role',
    delete: 'remove_page_member',
    resourceType: 'page_member',
    optimistic: { create: 'append', update: 'merge', delete: 'remove' },
  },
});

// ============================================================================
// 2. COMPONENTS
// ============================================================================

function PageList() {
  const {
    data: pages,
    isLoading,
    error,
    create,
    update,
    delete: deletePage,
    errors,
  } = useResource<{ id: string; title: string; content: string }>('Page');

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Pages</h2>

      {/* Show rollback errors */}
      {errors.failedTransactions.length > 0 && (
        <div style={{ color: 'red' }}>
          {errors.failedTransactions.map((tx) => (
            <div key={tx.id}>Failed: {tx.error.message}</div>
          ))}
        </div>
      )}

      <button onClick={() => create({ title: 'New Page', content: '' })}>Create Page</button>

      <ul>
        {pages?.map((page) => (
          <li key={page.id}>
            <strong>{page.title}</strong>
            <button onClick={() => update(page.id, { title: `${page.title} (edited)` })}>Edit</button>
            <button onClick={() => deletePage(page.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// 3. APP SETUP
// ============================================================================

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TransactionProvider
        config={{
          baseUrl: '/api',
          maxRetries: 3,
          retryDelay: 1000,
          getAuthHeaders: () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` }),
          getOrganizationId: () => localStorage.getItem('orgId'),
        }}
      >
        <PageList />
      </TransactionProvider>
    </QueryClientProvider>
  );
}

export default App;
