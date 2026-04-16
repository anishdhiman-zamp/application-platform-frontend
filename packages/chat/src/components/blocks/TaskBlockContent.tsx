'use client';

import { ShimmerText, Skeleton } from '@zamp-platform/ui';
import React, { type FC } from 'react';

interface TaskBlockContentProps {
  isLoading: boolean;
  isInProgress: boolean;
  displayedSummary: string | null;
}

const TaskBlockContent: FC<TaskBlockContentProps> = ({ isLoading, isInProgress, displayedSummary }) => {
  if (isLoading) {
    return (
      <div className='flex flex-col gap-2 py-1'>
        <Skeleton className='h-3 w-3/4 rounded' />
        <Skeleton className='h-3 w-1/2 rounded' />
      </div>
    );
  }

  if (isInProgress) {
    return (
      <div className={`f-14-450 line-clamp-2 ${displayedSummary ? 'text-GRAY_950' : 'text-GRAY_700 py-2'}`}>
        <ShimmerText text={displayedSummary || 'Starting now'} autoAnimate />
      </div>
    );
  }

  return null;
};

export default TaskBlockContent;
