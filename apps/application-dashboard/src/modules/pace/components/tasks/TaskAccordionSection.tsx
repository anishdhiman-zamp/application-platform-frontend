'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { TaskStatus } from '@zamp-platform/chat';
import { TaskStatusIcon } from '@zamp-platform/chat';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import { Play } from 'lucide-react';
import { STATUS_LABELS } from 'modules/pace/components/tasks/task-listing.constants';
import TaskRow from 'modules/pace/components/tasks/TaskRow';
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
  const { tasks, totalCount, fetchNextPage, isFetching, hasMore } = useTasksByStatus({ status, search });
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(isFetching);

  isFetchingRef.current = isFetching;

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && !isFetchingRef.current && hasMore) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasMore],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = scrollContainerRef?.current;

    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      root: root ?? null,
      rootMargin: '0px 0px 300px 0px',
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [scrollContainerRef, handleIntersect]);

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
        <span className='f-13-500 text-GRAY_600 truncate'>{count}</span>
      </AccordionTrigger>
      <AccordionContent className='p-0' disableAnimation>
        <div>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
          {hasMore && <div ref={sentinelRef} className='h-px' />}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TaskAccordionSection;
