'use client';

import { FC, memo } from 'react';
import { Skeleton } from '@zamp-platform/ui';

/**
 * Skeleton for the process name title
 */

/**
 * Skeleton mimicking markdown content structure with headings, paragraphs, and lists
 */
export const MarkdownContentSkeleton: FC = () => (
  <div className='flex flex-col gap-6'>
    {/* Step heading */}
    <Skeleton className='mb-4 h-6.5 w-64 rounded' />
    <div className='flex flex-col gap-3'>
      <Skeleton className='h-6 w-72 rounded' />
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-4 w-full rounded' />
        <Skeleton className='h-4 w-11/12 rounded' />
        <Skeleton className='h-4 w-4/5 rounded' />
      </div>
    </div>

    {/* Additional info section */}
    <div className='flex flex-col gap-3'>
      <Skeleton className='h-5 w-48 rounded' />
      <div className='ml-4 flex flex-col gap-2'>
        {/* List items */}
        <div className='flex items-center gap-2'>
          <Skeleton className='h-2 w-2 rounded-full' />
          <Skeleton className='h-4 w-80 rounded' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-2 w-2 rounded-full' />
          <Skeleton className='h-4 w-72 rounded' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-2 w-2 rounded-full' />
          <Skeleton className='h-4 w-64 rounded' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-2 w-2 rounded-full' />
          <Skeleton className='h-4 w-56 rounded' />
        </div>
      </div>
    </div>

    {/* Another step */}
    <div className='flex flex-col gap-3'>
      <Skeleton className='h-6 w-80 rounded' />
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-4 w-full rounded' />
        <Skeleton className='h-4 w-10/12 rounded' />
        <Skeleton className='h-4 w-9/12 rounded' />
      </div>
    </div>

    {/* More list items */}
    <div className='flex flex-col gap-3'>
      <Skeleton className='h-5 w-56 rounded' />
      <div className='ml-4 flex flex-col gap-2'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-2 w-2 rounded-full' />
          <Skeleton className='h-4 w-96 rounded' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-2 w-2 rounded-full' />
          <Skeleton className='h-4 w-80 rounded' />
        </div>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-2 w-2 rounded-full' />
          <Skeleton className='h-4 w-72 rounded' />
        </div>
      </div>
    </div>

    {/* Final section */}
    <div className='flex flex-col gap-3'>
      <Skeleton className='h-6 w-64 rounded' />
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-4 w-full rounded' />
        <Skeleton className='h-4 w-11/12 rounded' />
        <Skeleton className='h-4 w-3/4 rounded' />
      </div>
    </div>
  </div>
);

MarkdownContentSkeleton.displayName = 'MarkdownContentSkeleton';

export default memo(MarkdownContentSkeleton);
