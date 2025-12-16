/**
 * PageItem Component
 *
 * Displays a single page with edit/delete actions.
 */

'use client';

import { type ChangeEvent, type KeyboardEvent, useCallback, useState } from 'react';
import type { Page } from 'app/(authenticated)/battalion-example/types';

interface PageItemProps {
  page: Page;
  onUpdate: (pageId: string, name: string) => void;
  onDelete: (pageId: string) => void;
}

export function PageItem({ page, onUpdate, onDelete }: PageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(page.name);

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setEditName(page.name);
  }, [page.name]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditName(page.name);
  }, [page.name]);

  const handleSave = useCallback(() => {
    if (editName.trim() && editName !== page.name) {
      onUpdate(page.page_id, editName.trim());
    }
    setIsEditing(false);
  }, [editName, page.name, page.page_id, onUpdate]);

  const handleDelete = useCallback(() => {
    onDelete(page.page_id);
  }, [page.page_id, onDelete]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') handleCancelEdit();
    },
    [handleSave, handleCancelEdit],
  );

  if (isEditing) {
    return (
      <div className='flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3'>
        <input
          type='text'
          value={editName}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          autoFocus
          className='flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
        />
        <button
          onClick={handleSave}
          className='rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700'
        >
          Save
        </button>
        <button
          onClick={handleCancelEdit}
          className='rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50'
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className='flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50'>
      <div>
        <p className='font-medium text-gray-900'>{page.name}</p>
        <p className='text-sm text-gray-500'>
          {page.sheets?.length || 0} sheets · {page.description || 'No description'}
        </p>
      </div>
      <div className='flex gap-1'>
        <button onClick={handleStartEdit} className='rounded p-2 text-gray-500 hover:bg-gray-100' title='Edit page'>
          <EditIcon className='h-4 w-4' />
        </button>
        <button onClick={handleDelete} className='rounded p-2 text-red-500 hover:bg-red-50' title='Delete page'>
          <TrashIcon className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7' />
      <path d='M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z' />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
      <path d='M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2' />
    </svg>
  );
}
