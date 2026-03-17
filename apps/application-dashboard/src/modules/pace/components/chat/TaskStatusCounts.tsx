'use client';

import { type FC, type RefObject, useEffect, useMemo, useState } from 'react';
import {
  type ChatMessage,
  type StreamingState,
  TASK_STATUS,
  TaskBlock,
  type TaskStatus,
  TaskStatusIcon,
} from '@zamp-platform/chat';
import { Popover, PopoverContent, PopoverTrigger, SearchInput } from '@zamp-platform/ui';
import { useTasksFromMessages } from '@/modules/pace/hooks/useTasksFromMessages';
import ProcessEmptyState from '@/modules/process/activity-runs/components/ProcessEmptyState';

const POPOVER_STATUS_ORDER: TaskStatus[] = [
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.FAILED,
  TASK_STATUS.NEEDS_INPUT,
  TASK_STATUS.COMPLETED,
];

const PILL_STATUS_ORDER: TaskStatus[] = [
  TASK_STATUS.COMPLETED,
  TASK_STATUS.IN_PROGRESS,
  TASK_STATUS.NEEDS_INPUT,
  TASK_STATUS.FAILED,
];

interface TaskStatusCountsProps {
  messages: ChatMessage[];
  streamingState?: StreamingState | null;
  conversationId?: string;
  containerRef: RefObject<HTMLDivElement | null>;
  onOpenChange?: (open: boolean) => void;
}

const TaskStatusCounts: FC<TaskStatusCountsProps> = ({
  messages,
  streamingState,
  conversationId,
  containerRef,
  onOpenChange,
}) => {
  const { tasks, counts, hasTasks } = useTasksFromMessages(messages, streamingState);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerPaddingX, setContainerPaddingX] = useState(0);

  const visiblePillStatuses = useMemo(() => PILL_STATUS_ORDER.filter((s) => counts[s] > 0), [counts]);

  const sortedAndFilteredTasks = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = query ? tasks.filter((t) => t.title.toLowerCase().includes(query)) : tasks;

    return [...filtered].sort((a, b) => {
      return POPOVER_STATUS_ORDER.indexOf(a.status) - POPOVER_STATUS_ORDER.indexOf(b.status);
    });
  }, [tasks, searchQuery]);

  useEffect(() => {
    const el = containerRef.current;

    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
        const paddingLeft = parseFloat(getComputedStyle(entry.target).paddingLeft) || 0;

        setContainerPaddingX(paddingLeft);
      }
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [containerRef]);

  if (!hasTasks) return null;

  return (
    <div className='relative'>
      {isOpen && (
        <div
          className='pointer-events-none absolute bottom-full h-screen backdrop-blur-sm'
          style={{ left: -containerPaddingX, right: -containerPaddingX }}
        />
      )}
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          onOpenChange?.(open);
          if (!open) setSearchQuery('');
        }}
      >
        <PopoverTrigger asChild>
          <div className='border-GRAY_400 bg-BG_GRAY_2 hover:bg-GRAY_200 mb-2 flex w-fit cursor-pointer items-center gap-3 rounded-[8px] border p-2 transition-colors'>
            {visiblePillStatuses.map((status) => (
              <div key={status} className='flex items-center gap-1.5'>
                <TaskStatusIcon status={status} />
                <span className='f-13-450'>{counts[status]}</span>
              </div>
            ))}
          </div>
        </PopoverTrigger>

        <PopoverContent
          side='top'
          align='start'
          sideOffset={8}
          avoidCollisions={false}
          className='flex h-[600px] flex-col !rounded-[20px] p-0'
          style={
            containerWidth ? { width: containerWidth, minWidth: containerWidth, maxWidth: containerWidth } : undefined
          }
        >
          <div className='shrink-0 px-3 pt-4'>
            <SearchInput
              placeholder='Search tasks'
              value={searchQuery}
              onChange={setSearchQuery}
              wrapperClassName='w-full'
              className='!border-none !shadow-none !ring-0 focus:!border-none focus:!ring-0'
            />
          </div>

          <div className='flex-1 overflow-y-auto px-4 pt-4 [scrollbar-width:thin]'>
            <div className='flex flex-col gap-3'>
              {sortedAndFilteredTasks.map((task) => (
                <TaskBlock
                  key={task.blockId}
                  payload={{
                    id: task.id,
                    title: task.title,
                    task_id: task.task_id,
                    status: task.status,
                  }}
                  conversationId={conversationId}
                />
              ))}
              {sortedAndFilteredTasks.length === 0 && (
                <div className='flex h-full items-center justify-center [&>div]:!min-h-0'>
                  <ProcessEmptyState title='No tasks found' description='' />
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TaskStatusCounts;
