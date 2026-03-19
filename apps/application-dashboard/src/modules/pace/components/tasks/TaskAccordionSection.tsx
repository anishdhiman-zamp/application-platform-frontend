'use client';

import { type FC, useCallback, useRef } from 'react';
import type { TaskStatus } from '@zamp-platform/chat';
import { TaskStatusIcon } from '@zamp-platform/chat';
import { useInfiniteScroll } from '@zamp-platform/tanstack-table';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@zamp-platform/ui';
import { ChevronRight } from 'lucide-react';
import { STATUS_LABELS } from 'modules/pace/components/tasks/task-listing.constants';
import TaskRow from 'modules/pace/components/tasks/TaskRow';
import { useMockTasksByStatus } from 'modules/pace/components/tasks/useTaskListingMockData';

interface TaskAccordionSectionProps {
  status: TaskStatus;
  count: number;
  search?: string;
}

const TaskAccordionSection: FC<TaskAccordionSectionProps> = ({ status, count, search }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { tasks, totalCount, fetchNextPage, isFetching } = useMockTasksByStatus(status, search);

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

  return (
    <AccordionItem value={status} className='border-GRAY_400'>
      <AccordionTrigger
        icon={ChevronRight}
        iconRotation={90}
        className='bg-BG_GRAY_1 border-GRAY_400 justify-start! gap-1.5 px-3 py-2.5 data-[state=open]:border-b data-[state=open]:bg-[rgba(166,166,166,0.1)] [&>svg]:order-first [&>svg]:h-3 [&>svg]:w-3'
      >
        <div className='flex items-center gap-2'>
          <TaskStatusIcon status={status} />
          <span className='f-13-500 text-GRAY_950 truncate'>{STATUS_LABELS[status]}</span>
        </div>
        <span className='f-13-500 text-GRAY_600 truncate'>{count}</span>
      </AccordionTrigger>
      <AccordionContent className='p-0'>
        <div
          ref={containerRef}
          className='max-h-[60vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          onScroll={handleScroll}
        >
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
          {isFetching && (
            <div className='flex items-center justify-center py-3'>
              <span className='f-12-400 text-GRAY_600'>Loading more...</span>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TaskAccordionSection;
