/**
 * PageList Component
 *
 * Displays the list of pages with CRUD operations.
 * Uses Battalion's useResource hook directly.
 */

'use client';

import { useResource } from '@zamp-platform/battalion';
import { CreatePageForm } from 'app/(authenticated)/battalion-example/components/CreatePageForm';
import { ErrorDisplay } from 'app/(authenticated)/battalion-example/components/ErrorDisplay';
import { PageItem } from 'app/(authenticated)/battalion-example/components/PageItem';
import { SyncIndicator } from 'app/(authenticated)/battalion-example/components/SyncIndicator';
import type { Page } from 'app/(authenticated)/battalion-example/resources';

export function PageList() {
  // Direct usage of Battalion's useResource
  const {
    data: pages,
    isLoading,
    isFetching,
    error,
    create,
    update,
    delete: deletePage,
    refetch,
    transactions,
    errors,
    sync,
  } = useResource<Page>('Page');

  // Loading state
  if (isLoading) {
    return (
      <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='flex items-center gap-2 text-gray-500'>
          <LoadingSpinner className='h-4 w-4' />
          <span>Loading pages...</span>
          {sync.loadedFromCache && <span className='text-xs text-purple-500'>(from cache)</span>}
        </div>
      </div>
    );
  }

  // Error state - handle gracefully
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load pages';
    const isAuthError = errorMessage.includes('401');

    return (
      <div className='rounded-lg border border-red-200 bg-white p-6 shadow-sm'>
        <div className='mb-2 flex items-center gap-2 text-red-600'>
          <ErrorIcon className='h-5 w-5' />
          <span className='font-medium'>{isAuthError ? 'Authentication Error' : 'Error Loading Pages'}</span>
        </div>
        <p className='mb-4 text-sm text-gray-600'>
          {isAuthError ? 'Your session may have expired. Please refresh the page or log in again.' : errorMessage}
        </p>
        <button onClick={() => refetch()} className='text-sm text-blue-600 hover:underline'>
          Try again
        </button>
      </div>
    );
  }

  const handleCreate = (data: { name: string }) => {
    create({ name: data.name, description: '', sheets: [] } as Partial<Page>);
  };

  const handleUpdate = (pageId: string, name: string) => {
    update(pageId, { name } as Partial<Page>);
  };

  return (
    <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
      {/* Header */}
      <div className='border-b border-gray-200 p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>Pages</h2>
            <p className='text-sm text-gray-500'>
              Using <code className='rounded bg-gray-100 px-1 text-xs'>useResource&lt;Page&gt;(&apos;Page&apos;)</code>
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <SyncIndicator hasPending={transactions.hasPending} isFetching={isFetching} syncState={sync} />
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className='rounded-md border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50'
              title='Refresh'
            >
              <RefreshIcon className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='space-y-4 p-4'>
        {/* Live sync info */}
        {sync.loadedFromCache && (
          <div className='flex items-center gap-2 rounded-md bg-purple-50 p-2 text-xs text-purple-700'>
            <CacheIcon className='h-4 w-4' />
            <span>Loaded from cache • Last synced {sync.lastSyncAt ? formatTimeAgo(sync.lastSyncAt) : 'never'}</span>
            {sync.isSyncing && <span className='text-purple-500'>(Refreshing...)</span>}
          </div>
        )}

        {/* Error display for failed transactions */}
        {errors.failedTransactions.length > 0 && <ErrorDisplay failedTransactions={errors.failedTransactions} />}

        {/* Create form */}
        <CreatePageForm onSubmit={handleCreate} isSubmitting={transactions.hasPending} />

        {/* Page list */}
        <div className='space-y-2'>
          {(!pages || pages.length === 0) && (
            <p className='py-8 text-center text-gray-500'>No pages yet. Create one above.</p>
          )}
          {pages?.map((page) => (
            <PageItem key={page.page_id} page={page} onUpdate={handleUpdate} onDelete={deletePage} />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return date.toLocaleDateString();
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox='0 0 24 24' fill='none'>
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15' />
    </svg>
  );
}

function ErrorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <circle cx='12' cy='12' r='10' />
      <line x1='12' y1='8' x2='12' y2='12' />
      <line x1='12' y1='16' x2='12.01' y2='16' />
    </svg>
  );
}

function CacheIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M21 12c0 1.66-4 3-9 3s-9-1.34-9-3' />
      <path d='M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5' />
      <ellipse cx='12' cy='5' rx='9' ry='3' />
      <path d='M3 12c0 1.66 4 3 9 3s9-1.34 9-3' />
    </svg>
  );
}
