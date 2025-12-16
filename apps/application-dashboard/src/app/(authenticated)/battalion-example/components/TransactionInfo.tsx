/**
 * TransactionInfo Component
 *
 * Explains how Battalion transactions and live sync work.
 */

'use client';

export function TransactionInfo() {
  return (
    <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
      <div className='border-b border-gray-200 p-4'>
        <h3 className='text-lg font-semibold text-gray-900'>How Battalion Works</h3>
      </div>
      <div className='space-y-4 p-4 text-sm'>
        <InfoItem
          emoji='🚀'
          title='Fire and Forget'
          description='Mutations are sent to the Transactions API without waiting. UI updates optimistically.'
        />
        <InfoItem
          emoji='💾'
          title='IndexedDB Persistence'
          description='Transaction requests are stored locally until confirmed by backend.'
        />
        <InfoItem
          emoji='🔄'
          title='Automatic Retry'
          description='5xx errors trigger exponential backoff. 4xx errors trigger rollback handlers.'
        />
        <InfoItem
          emoji='📦'
          title='Batching'
          description='Sequential operations on the same resource are batched into one transaction.'
        />
        <div className='mt-4 border-t border-gray-200 pt-4'>
          <h4 className='mb-3 font-semibold text-gray-900'>Live Sync Features</h4>
          <div className='space-y-3'>
            <InfoItem
              emoji='📡'
              title='Polling / SSE'
              description='Resources can sync via polling (configurable interval) or Server-Sent Events.'
            />
            <InfoItem
              emoji='⚡'
              title='OPFS Storage'
              description='Data is persisted in Origin Private File System for instant loading on revisit.'
            />
            <InfoItem
              emoji='🔁'
              title='Background Sync'
              description='Cached data shows immediately while fresh data loads in the background.'
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface InfoItemProps {
  emoji: string;
  title: string;
  description: string;
}

function InfoItem({ emoji, title, description }: InfoItemProps) {
  return (
    <div className='space-y-1'>
      <h4 className='font-medium text-gray-900'>
        {emoji} {title}
      </h4>
      <p className='text-gray-600'>{description}</p>
    </div>
  );
}
