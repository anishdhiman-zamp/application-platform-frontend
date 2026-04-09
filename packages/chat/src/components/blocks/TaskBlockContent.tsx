'use client';

import { ShimmerText, Skeleton } from '@zamp-platform/ui';
import { formatPlural } from '@zamp-platform/utils';
import { ChevronDown } from 'lucide-react';
import React, { type FC } from 'react';

import type { ToolCallInfo } from '../../types/block.types';

interface TaskBlockContentProps {
  isLoading: boolean;
  isInProgress: boolean;
  displayedSummary: string | null;
  previousCount: number;
  lastToolCall: ToolCallInfo | null;
  getToolIcon: (toolCall: ToolCallInfo | null | undefined) => React.ReactNode;
  renderToolCallTrigger: (toolCall: ToolCallInfo | null | undefined) => React.ReactNode;
}

const TaskBlockContent: FC<TaskBlockContentProps> = ({
  isLoading,
  isInProgress,
  displayedSummary,
  previousCount,
  lastToolCall,
  getToolIcon,
  renderToolCallTrigger,
}) => {
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

  return (
    <>
      {previousCount > 0 && (
        <div>
          <div className='flex items-center gap-2'>
            <ChevronDown size={14} className='text-GRAY_700' />
            <span className='f-14-450 text-GRAY_950'>{formatPlural(previousCount, 'step', 'steps')}</span>
          </div>
          {lastToolCall && <div className='border-GRAY_400 ml-[7px] h-4 border-l' />}
        </div>
      )}

      {lastToolCall && (
        <div className='flex w-full items-center gap-2 pt-0.5'>
          <div className='flex h-4 w-4 shrink-0 items-center justify-center'>{getToolIcon(lastToolCall)}</div>
          {renderToolCallTrigger(lastToolCall)}
        </div>
      )}
    </>
  );
};

export default TaskBlockContent;
