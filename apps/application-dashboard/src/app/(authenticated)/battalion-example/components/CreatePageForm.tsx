/**
 * CreatePageForm Component
 *
 * Form for creating new pages via Battalion transactions.
 */

'use client';

import { type ChangeEvent, type FormEvent, type KeyboardEvent, useCallback, useState } from 'react';

interface CreatePageFormProps {
  onSubmit: (data: { name: string; description?: string }) => void;
  isSubmitting: boolean;
}

export function CreatePageForm({ onSubmit, isSubmitting }: CreatePageFormProps) {
  const [pageName, setPageName] = useState('');

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!pageName.trim() || isSubmitting) return;

      // This calls Battalion's create which:
      // 1. Sends transaction request (fire and forget)
      // 2. Optimistically updates the UI
      onSubmit({ name: pageName.trim() });

      setPageName('');
    },
    [pageName, isSubmitting, onSubmit],
  );

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPageName(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSubmit(e as unknown as FormEvent);
      }
    },
    [handleSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className='flex gap-2'>
      <input
        type='text'
        placeholder='New page name...'
        value={pageName}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        className='flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100'
      />
      <button
        type='submit'
        disabled={!pageName.trim() || isSubmitting}
        className='inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300'
      >
        {isSubmitting ? <LoadingSpinner className='h-4 w-4' /> : <PlusIcon className='mr-1 h-4 w-4' />}
        Create
      </button>
    </form>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M12 5v14M5 12h14' />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox='0 0 24 24' fill='none'>
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
    </svg>
  );
}
