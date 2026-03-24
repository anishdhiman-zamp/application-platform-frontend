'use client';

import type { FC } from 'react';
import { Skeleton } from '@zamp-platform/ui';

interface TaskRowSkeletonProps {
  count?: number;
}

const TaskRowSkeleton: FC<TaskRowSkeletonProps> = ({ count = 3 }) => {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className='flex h-[42px] items-center gap-3 pr-4 pl-7.5'>
          <Skeleton className='h-2.5 w-2.5 shrink-0 rounded' />
          <Skeleton className='h-4 w-48 rounded' />
          <div className='flex-1' />
          <Skeleton className='h-4 w-32 rounded' />
          <Skeleton className='h-4 w-8 rounded' />
          <Skeleton className='h-5 w-5 rounded-full' />
          <Skeleton className='h-4 w-12 rounded' />
        </div>
      ))}
    </>
  );
};

export default TaskRowSkeleton;
