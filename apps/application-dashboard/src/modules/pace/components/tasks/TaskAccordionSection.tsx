'use client';

import { useCallback, useRef } from 'react';
import type { TaskStatus } from '@zamp-platform/chat';
import { TaskStatusIcon } from '@zamp-platform/chat';
import { useInfiniteScroll } from '@zamp-platform/tanstack-table';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Play } from 'lucide-react';
import { STATUS_LABELS } from 'modules/pace/components/tasks/task-listing.constants';
import TaskRow from 'modules/pace/components/tasks/TaskRow';
import TaskRowSkeleton from 'modules/pace/components/tasks/TaskRowSkeleton';
import { useTasksByStatus } from 'modules/pace/components/tasks/useTasksByStatus';

interface TaskAccordionSectionProps {
  status: TaskStatus;
  count: number;
  search?: string;
}

const PlayIcon = ({ className }: { className?: string }) => (
  <Play className={className} fill='currentColor' strokeWidth={0} />
);

const TaskAccordionSection = ({ status, count, search }: TaskAccordionSectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { tasks, totalCount, fetchNextPage, isFetching } = useTasksByStatus({ status, search });

  const { fetchMoreOnBottomReached } = useInfiniteScroll({
    fetchNextPage,
    isFetching,
    totalFetched: tasks.length,
    totalRowCount: totalCount,
    hasDataSource: true,
    threshold: 300,
  });

  const handleScroll = useCallback(() => {
    fetchMoreOnBottomReached(containerRef.current);
  }, [fetchMoreOnBottomReached]);

  if (search && !isFetching && totalCount === 0) return null;

  return (
    <AccordionItem
      ref={containerRef}
      value={status}
      onScroll={handleScroll}
      className={cn(
        'border-GRAY_400 bg-GRAY_1 shrink-0',
        !search &&
          '[&[data-state=open]>*:first-child]:bg-GRAY_50 data-[state=open]:min-h-0 data-[state=open]:shrink data-[state=open]:overflow-y-auto data-[state=open]:[scrollbar-width:thin] [&[data-state=open]>*:first-child]:sticky [&[data-state=open]>*:first-child]:top-0 [&[data-state=open]>*:first-child]:z-10',
      )}
    >
      <AccordionTrigger
        icon={PlayIcon}
        iconRotation={90}
        className='border-GRAY_400 data-[state=open]:bg-GRAY_100 [&>svg]:text-GRAY_1000 [&[data-state=open]>svg]:text-GRAY_600 cursor-pointer justify-start! gap-1.5 px-3 py-2.5 [&>svg]:order-first [&>svg]:h-2 [&>svg]:w-2 [&>svg]:transition-all [&>svg]:duration-300'
      >
        <div className='flex items-center gap-2'>
          <TaskStatusIcon status={status} />
          <span className='f-13-500 text-GRAY_950 truncate'>{STATUS_LABELS[status]}</span>
        </div>
        <span className='f-13-500 text-GRAY_600 truncate'>{search ? totalCount : count}</span>
      </AccordionTrigger>
      <AccordionContent className='p-0'>
        <div>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
          {isFetching && <TaskRowSkeleton />}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TaskAccordionSection;
