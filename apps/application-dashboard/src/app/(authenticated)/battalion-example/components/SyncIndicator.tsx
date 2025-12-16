/**
 * SyncIndicator Component
 *
 * Displays the live sync status including:
 * - Connection status
 * - Background sync activity
 * - Cache load status
 * - Last sync time
 */

'use client';

import { LiveSyncState } from '@zamp-platform/battalion';

interface SyncIndicatorProps {
  hasPending: boolean;
  isFetching: boolean;
  syncState?: LiveSyncState;
}

export function SyncIndicator({ hasPending, isFetching, syncState }: SyncIndicatorProps) {
  const isConnected = syncState?.isConnected ?? false;
  const isSyncing = syncState?.isSyncing ?? false;
  const loadedFromCache = syncState?.loadedFromCache ?? false;
  const lastSyncAt = syncState?.lastSyncAt;

  // Determine the status
  const getStatus = () => {
    if (hasPending) return { label: 'Saving...', color: 'text-yellow-600', animate: true };
    if (isSyncing || isFetching) return { label: 'Syncing...', color: 'text-blue-600', animate: true };
    if (loadedFromCache) return { label: 'From cache', color: 'text-purple-600', animate: false };
    if (isConnected) return { label: 'Live', color: 'text-green-600', animate: false };

    return { label: 'Offline', color: 'text-gray-400', animate: false };
  };

  const status = getStatus();

  // Format last sync time
  const formatLastSync = (date: Date | null) => {
    if (!date) return null;
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className='flex items-center gap-2'>
      {/* Status indicator */}
      <div className='flex items-center gap-1.5'>
        <div className={`relative flex h-2 w-2`}>
          <span
            className={`${status.animate ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full opacity-75 ${
              status.color === 'text-green-600'
                ? 'bg-green-400'
                : status.color === 'text-blue-600'
                  ? 'bg-blue-400'
                  : status.color === 'text-yellow-600'
                    ? 'bg-yellow-400'
                    : status.color === 'text-purple-600'
                      ? 'bg-purple-400'
                      : 'bg-gray-400'
            }`}
          />
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${
              status.color === 'text-green-600'
                ? 'bg-green-500'
                : status.color === 'text-blue-600'
                  ? 'bg-blue-500'
                  : status.color === 'text-yellow-600'
                    ? 'bg-yellow-500'
                    : status.color === 'text-purple-600'
                      ? 'bg-purple-500'
                      : 'bg-gray-400'
            }`}
          />
        </div>
        <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
      </div>

      {/* Last sync time */}
      {lastSyncAt && !hasPending && !isSyncing && (
        <span className='text-xs text-gray-400'>· {formatLastSync(lastSyncAt)}</span>
      )}

      {/* Cache indicator */}
      {loadedFromCache && (
        <span className='text-xs text-purple-500' title='Data loaded from OPFS cache'>
          <CacheIcon className='inline h-3.5 w-3.5' />
        </span>
      )}
    </div>
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
