'use client';

import { useCallback } from 'react';
import { SiblingTask, TaskBreadcrumb, TaskStatusIcon } from '@zamp-platform/chat';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowRight } from 'lucide-react';
import { KEYBOARD_KEYS } from '@/constants/shortcuts';
import NestedSubtaskCount from '@/modules/pace/components/tasks/components/NestedSubtaskCount';
import type { SubTask } from '@/modules/pace/components/tasks/types/tasks.types';

interface SubtaskListItemProps {
  subtask: SubTask;
  siblings: SiblingTask[];
  statusIndex: number;
  statusTotal: number;
  parentTasks?: TaskBreadcrumb[];
  variant?: 'panel' | 'popover';
  onNavigate: (subtask: SubTask, statusIndex: number, statusTotal: number) => void;
  nestedIndicator?: React.ReactNode;
}

const SubtaskListItem = ({
  subtask,
  statusIndex,
  statusTotal,
  variant = 'panel',
  onNavigate,
  nestedIndicator,
}: SubtaskListItemProps) => {
  const nestedSubtasks = subtask.subtasks ?? [];
  const hasNested = nestedSubtasks.length > 0;

  const handleClick = useCallback(() => {
    onNavigate(subtask, statusIndex, statusTotal);
  }, [onNavigate, subtask, statusIndex, statusTotal]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  const isPanelVariant = variant === 'panel';

  return (
    <Button
      variant='ghost'
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group flex w-full cursor-pointer items-center justify-start gap-2',
        isPanelVariant
          ? 'hover:bg-BG_GRAY_2 h-auto rounded-none px-4 py-2.5'
          : 'hover:bg-BG_GRAY_2 h-10 rounded-md px-3',
      )}
    >
      <TaskStatusIcon status={subtask.status} />
      <span className='f-13-450 text-GRAY_1000 min-w-0 flex-1 truncate text-left leading-[1.4]'>{subtask.title}</span>
      {hasNested && nestedIndicator ? (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {nestedIndicator}
        </div>
      ) : hasNested ? (
        <NestedSubtaskCount subtasks={nestedSubtasks} />
      ) : (
        <ArrowRight
          size={isPanelVariant ? 12 : 10}
          className='text-GRAY_600 shrink-0 opacity-0 transition-opacity group-hover:opacity-100'
        />
      )}
    </Button>
  );
};

export default SubtaskListItem;
