'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { TaskStatus } from '@zamp-platform/chat';
import { TaskStatusIcon } from '@zamp-platform/chat';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import { Play } from 'lucide-react';
import TaskRow from '@/modules/pace/components/tasks/components/TaskRow';
import { STATUS_LABELS } from '@/modules/pace/components/tasks/constants/tasks.constants';
import { useTasksByStatus } from '@/modules/pace/components/tasks/hooks/useTasksByStatus';
import type { CreationSource } from '@/modules/pace/components/tasks/types/tasks.types';

interface TaskAccordionSectionProps {
  status: TaskStatus;
  count: number;
  search?: string;
  agentId?: string;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  creationSource?: CreationSource;
  referrer?: string;
}

const PlayIcon = ({ className }: { className?: string }) => (
  <Play className={className} fill='currentColor' strokeWidth={0} />
);

const TaskAccordionSection = ({
  status,
  count,
  search,
  agentId,
  scrollContainerRef,
  creationSource,
  referrer,
}: TaskAccordionSectionProps) => {
  const sentinelNodeRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);

  const { tasks, totalCount, fetchNextPage, isFetching, hasMore } = useTasksByStatus({
    status,
    search,
    agentId,
    creationSource,
  });

  isFetchingRef.current = isFetching;

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0]?.isIntersecting && !isFetchingRef.current && hasMore) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasMore],
  );

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    sentinelNodeRef.current = node;
  }, []);

  useEffect(() => {
    const sentinel = sentinelNodeRef.current;
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
          {tasks.map((task, index) => (
            <TaskRow
              key={task.id}
              task={task}
              index={index}
              totalCount={totalCount}
              status={status}
              referrer={referrer}
            />
          ))}
          {hasMore && <div ref={sentinelRef} className='h-px' />}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TaskAccordionSection;
