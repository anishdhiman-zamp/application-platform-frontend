import React from 'react';
import { z } from 'zod';

import { defineResource, defineView, useResource, useView } from '../src';

// Define a Page resource
export const PageResource = defineResource({
  name: 'Page',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
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
    cache: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
  relations: {
    hasMany: ['Sheet'],
  },
});

// Define a Sheet resource
export const SheetResource = defineResource({
  name: 'Sheet',
  schema: z.object({
    id: z.string(),
    title: z.string(),
    pageId: z.string(),
    widgets: z.array(z.any()),
  }),
  endpoints: {
    list: '/api/sheets',
    create: '/api/sheets',
    update: '/api/sheets/:id',
    delete: '/api/sheets/:id',
  },
  behaviors: {
    optimistic: {
      create: 'append',
      update: 'merge',
      delete: 'remove',
    },
    liveSync: true,
  },
  relations: {
    belongsTo: ['Page'],
    hasMany: ['Widget'],
  },
});

// Define a Dashboard view
export const DashboardView = defineView({
  name: 'Dashboard',
  uses: [
    { entity: 'Page', alias: 'pages' },
    { entity: 'Sheet', alias: 'sheets', dependsOn: ['pages'] }, // Single dependency
  ],
});

// Example with multiple dependencies
export const ComplexDashboardView = defineView({
  name: 'ComplexDashboard',
  uses: [
    { entity: 'Page', alias: 'pages' },
    { entity: 'User', alias: 'users' },
    { entity: 'Sheet', alias: 'sheets', dependsOn: ['pages', 'users'] }, // Multiple dependencies - waits for both pages AND users
    { entity: 'Widget', alias: 'widgets', dependsOn: ['sheets'] }, // Depends on sheets
  ],
});

// Example component using the resource directly
export function PageList() {
  const { data: pages, create, isLoading, isCreating } = useResource('Page');

  const handleCreatePage = () => {
    create({
      title: 'New Page',
      content: 'This is a new page',
    });
  };

  if (isLoading) return <div>Loading pages...</div>;

  return (
    <div>
      <h2>Pages</h2>
      <button onClick={handleCreatePage} disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Page'}
      </button>
      <ul>
        {pages?.map((page) => (
          <li key={page.id}>
            <h3>{page.title}</h3>
            <p>{page.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Example component using the view
export function Dashboard() {
  const { data, actions, uiState } = useView('Dashboard');

  const handleCreatePage = () => {
    actions.createPage({
      title: 'New Page',
      content: 'This is a new page',
    });
  };

  return (
    <div>
      <h1>Dashboard</h1>

      {uiState.isLoading && <div>Loading...</div>}
      {uiState.hasError && <div>Error loading data</div>}

      <div>
        <h2>Pages ({data.pages?.length || 0})</h2>
        <button onClick={handleCreatePage}>Create Page</button>
        <ul>
          {data.pages?.map((page) => (
            <li key={page.id}>
              <h3>{page.title}</h3>
              <p>{page.content}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Sheets ({data.sheets?.length || 0})</h2>
        <ul>
          {data.sheets?.map((sheet) => (
            <li key={sheet.id}>
              <h3>{sheet.title}</h3>
              <p>Page: {sheet.pageId}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
