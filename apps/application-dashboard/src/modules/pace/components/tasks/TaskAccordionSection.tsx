'use client';

import { useEffect } from 'react';
import type { TaskStatus } from '@zamp-platform/chat';
import { TaskStatusIcon } from '@zamp-platform/chat';
import { useInfiniteScroll } from '@zamp-platform/tanstack-table';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import { Play } from 'lucide-react';
import { STATUS_LABELS } from 'modules/pace/components/tasks/task-listing.constants';
import TaskRow from 'modules/pace/components/tasks/TaskRow';
import TaskRowSkeleton from 'modules/pace/components/tasks/TaskRowSkeleton';
import { useTasksByStatus } from 'modules/pace/components/tasks/useTasksByStatus';

interface TaskAccordionSectionProps {
  status: TaskStatus;
  count: number;
  search?: string;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}

const PlayIcon = ({ className }: { className?: string }) => (
  <Play className={className} fill='currentColor' strokeWidth={0} />
);

const TaskAccordionSection = ({ status, count, search, scrollContainerRef }: TaskAccordionSectionProps) => {
  const { tasks, totalCount, fetchNextPage, isFetching } = useTasksByStatus({ status, search });

  const { fetchMoreOnBottomReached } = useInfiniteScroll({
    fetchNextPage,
    isFetching,
    totalFetched: tasks.length,
    totalRowCount: totalCount,
    hasDataSource: true,
    threshold: 300,
  });

  useEffect(() => {
    if (!scrollContainerRef?.current) return;

    const el = scrollContainerRef.current;
    const onScroll = () => fetchMoreOnBottomReached(el);

    el.addEventListener('scroll', onScroll, { passive: true });

    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollContainerRef, fetchMoreOnBottomReached]);

  if (search && !isFetching && totalCount === 0) return null;

  return (
    <AccordionItem
      value={status}
      className='border-GRAY_400 bg-GRAY_1 [&>*:first-child]:bg-BG_GRAY_1 [&>*:first-child]:sticky [&>*:first-child]:top-0 [&>*:first-child]:z-10'
    >
      <AccordionTrigger
        icon={PlayIcon}
        iconRotation={90}
        className='border-GRAY_400 data-[state=open]:bg-GRAY_100 [&>svg]:text-GRAY_1000 [&[data-state=open]>svg]:text-GRAY_600 cursor-pointer justify-start! gap-1.5 px-3 py-2.5 [&>svg]:order-first [&>svg]:h-2 [&>svg]:w-2'
      >
        <div className='flex items-center gap-2'>
          <TaskStatusIcon status={status} />
          <span className='f-13-500 text-GRAY_950 truncate'>{STATUS_LABELS[status]}</span>
        </div>
        <span className='f-13-500 text-GRAY_600 truncate'>{search ? totalCount : count}</span>
      </AccordionTrigger>
      <AccordionContent className='p-0' disableAnimation>
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
