'use client';

import { type FC } from 'react';
import { Skeleton } from '@zamp-platform/ui';
import { cn } from '@/utils/common';

interface TaskContentSkeletonProps {
  className?: string;
}

const StepItemSkeleton = ({ isLast = false }: { isLast?: boolean }) => (
  <div className='flex items-start gap-3'>
    <div className='flex flex-col items-center'>
      <Skeleton className='h-2 w-2 shrink-0 rounded-full' />
      {!isLast && <Skeleton className='mt-1 h-10 w-px rounded-none' />}
    </div>
    <Skeleton className='mt-[-2px] h-3.5 w-2/3 rounded' />
  </div>
);

const TaskContentSkeleton: FC<TaskContentSkeletonProps> = ({ className }) => {
  return (
    <div className={cn('mx-auto flex w-full max-w-[700px] flex-col px-4 pt-12', className)}>
      <div className='flex flex-col gap-1.5'>
        <Skeleton className='h-5 w-3/5 rounded' />
        <Skeleton className='h-3.5 w-24 rounded' />
      </div>

      <div className='mt-8 flex items-center gap-2'>
        <Skeleton className='h-4 w-4 rounded' />
        <Skeleton className='h-3.5 w-20 rounded' />
      </div>

      <div className='mt-5 flex flex-col gap-1 pl-1'>
        <StepItemSkeleton />
        <StepItemSkeleton />
        <StepItemSkeleton />
        <StepItemSkeleton isLast />
      </div>
    </div>
  );
};

export default TaskContentSkeleton;
