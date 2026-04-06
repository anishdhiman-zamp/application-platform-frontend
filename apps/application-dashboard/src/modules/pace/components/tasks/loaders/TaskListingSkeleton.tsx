'use client';

import type { FC } from 'react';
import { Skeleton } from '@zamp-platform/ui';

interface TaskListingSkeletonProps {
  rowCount?: number;
}

const TaskListingSkeleton: FC<TaskListingSkeletonProps> = ({ rowCount = 8 }) => {
  return (
    <div className='border-GRAY_400 flex flex-1 flex-col rounded-xl border'>
      {Array.from({ length: 3 }, (_, groupIndex) => (
        <div key={groupIndex} className='mb-2'>
          <div className='flex items-center gap-2 px-4 py-3'>
            <Skeleton className='h-3 w-3 rounded' />
            <Skeleton className='h-4 w-24 rounded' />
            <Skeleton className='h-4 w-8 rounded' />
          </div>
          {groupIndex === 0 &&
            Array.from({ length: rowCount }, (_, rowIndex) => (
              <div key={rowIndex} className='flex items-center gap-3 px-4 py-2.5'>
                <Skeleton className='h-2.5 w-2.5 shrink-0 rounded' />
                <Skeleton className='h-4 w-48 rounded' />
                <div className='flex-1' />
                <Skeleton className='h-4 w-32 rounded' />
                <Skeleton className='h-4 w-8 rounded' />
                <Skeleton className='h-6 w-6 rounded-full' />
                <Skeleton className='h-4 w-12 rounded' />
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default TaskListingSkeleton;
