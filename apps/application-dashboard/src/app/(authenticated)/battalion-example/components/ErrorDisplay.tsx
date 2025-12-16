/**
 * ErrorDisplay Component
 *
 * Displays failed transactions from Battalion.
 */

'use client';

import type { FailedTransaction } from '@zamp-platform/battalion';

interface ErrorDisplayProps {
  failedTransactions: FailedTransaction[];
}

export function ErrorDisplay({ failedTransactions }: ErrorDisplayProps) {
  if (failedTransactions.length === 0) return null;

  return (
    <div className='rounded-md border border-red-200 bg-red-50 p-4'>
      <h4 className='text-sm font-medium text-red-800'>Failed Transactions ({failedTransactions.length})</h4>
      <div className='mt-2 space-y-1'>
        {failedTransactions.map((tx) => (
          <p key={tx.id} className='text-sm text-red-600'>
            <span className='font-medium capitalize'>{tx.action}:</span> {tx.error.message || 'Unknown error'}
          </p>
        ))}
      </div>
    </div>
  );
}
