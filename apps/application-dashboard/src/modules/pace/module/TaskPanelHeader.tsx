'use client';

import { memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { type TaskStatus, TaskStatusIcon } from '@zamp-platform/chat';
import { X } from 'lucide-react';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { useFilesPanelHeaderSlot } from '@/modules/pace/components/files-panel/FilesPanelHeaderSlot';
import TaskNavigation from '@/modules/pace/module/TaskNavigation';

interface TaskPanelHeaderProps {
  isActive: boolean;
  title: string;
  status?: TaskStatus;
  currentIndex: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  onGoToNextTask: () => void;
  onGoToPreviousTask: () => void;
}

const TaskPanelHeader = memo(
  ({
    isActive,
    title,
    status,
    currentIndex,
    totalCount,
    hasNext,
    hasPrevious,
    isLoading,
    isBootstrapping,
    onGoToNextTask,
    onGoToPreviousTask,
  }: TaskPanelHeaderProps) => {
    const headerSlot = useFilesPanelHeaderSlot();
    const { closeAllTabs } = useDynamicTabs();

    const handleClose = useCallback(() => {
      closeAllTabs();
    }, [closeAllTabs]);

    if (!isActive || !headerSlot) return null;

    return createPortal(
      <div className='border-GRAY_300 bg-BG_WHITE flex h-[54px] shrink-0 items-center justify-between gap-4 border-b px-4'>
        <div className='flex min-w-0 flex-1 items-center gap-2.5'>
          {status && (
            <span className='shrink-0'>
              <TaskStatusIcon status={status} />
            </span>
          )}
          <span className='text-GRAY_1000 f-14-500 block min-w-0 truncate'>{title || 'Untitled'}</span>
        </div>
        <div className='ml-4 flex shrink-0 items-center gap-6'>
          <TaskNavigation
            currentIndex={currentIndex}
            totalCount={totalCount}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            isLoading={isLoading}
            isBootstrapping={isBootstrapping}
            onGoToNextTask={onGoToNextTask}
            onGoToPreviousTask={onGoToPreviousTask}
            tone='dark'
          />
          <button
            type='button'
            onClick={handleClose}
            aria-label='Close panel'
            className='text-GRAY_1000 hover:bg-GRAY_100 flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors'
          >
            <X size={16} />
          </button>
        </div>
      </div>,
      headerSlot,
    );
  },
);

TaskPanelHeader.displayName = 'TaskPanelHeader';

export default TaskPanelHeader;
