'use client';

import { memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TASK_STATUS, type TaskStatus, TaskStatusIcon } from '@zamp-platform/chat';
import { Button } from '@zamp-platform/ui';
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
  onClose: () => void;
}

const STATUS_PILL_CONFIG: Partial<Record<TaskStatus, { label: string; className: string }>> = {
  [TASK_STATUS.COMPLETED]: {
    label: 'COMPLETED',
    className: 'border-GREEN_300 bg-GREEN_100 text-GREEN_1000',
  },
  [TASK_STATUS.IN_PROGRESS]: {
    label: 'IN PROGRESS',
    className: 'border-BLUE_300 bg-BLUE_100 text-BLUE_1000',
  },
  [TASK_STATUS.NEEDS_INPUT]: {
    label: 'NEEDS INPUT',
    className: 'border-ORANGE_300 bg-ORANGE_100 text-ORANGE_1000',
  },
};

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
    onClose,
  }: TaskPanelHeaderProps) => {
    const headerSlot = useFilesPanelHeaderSlot();
    const statusPill = status ? STATUS_PILL_CONFIG[status] : undefined;

    const handleClose = useCallback(() => {
      onClose();
    }, [onClose]);

    const header = (
      <div className='border-GRAY_300 bg-BG_WHITE flex h-[54px] shrink-0 items-center justify-between gap-4 border-b px-4'>
        <div className='flex min-w-0 flex-1 items-center gap-2.5'>
          {status && (
            <span className='shrink-0'>
              <TaskStatusIcon status={status} />
            </span>
          )}
          <span className='text-GRAY_1000 f-14-500 block min-w-0 truncate'>{title || 'Untitled'}</span>
          {statusPill && (
            <span
              className={`inline-flex h-6 shrink-0 items-center rounded-lg border px-2.5 font-mono text-[12px] leading-none font-medium whitespace-nowrap uppercase ${statusPill.className}`}
            >
              {statusPill.label}
            </span>
          )}
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
          <Button type='button' variant='secondary' size='small' onClick={handleClose}>
            Close
          </Button>
        </div>
      </div>
    );

    if (!isActive) return null;

    return headerSlot ? createPortal(header, headerSlot) : header;
  },
);

TaskPanelHeader.displayName = 'TaskPanelHeader';

export default TaskPanelHeader;
