'use client';

import { type FC, useMemo } from 'react';
import type { TaskStatus } from '@zamp-platform/chat';
import { Accordion } from '@zamp-platform/ui';
import { NEEDS_ACTION_STATUSES, STATUS_DISPLAY_ORDER } from 'modules/pace/components/tasks/task-listing.constants';
import { TASK_LISTING_TAB, type TaskListingTab } from 'modules/pace/components/tasks/task-listing.types';
import TaskAccordionSection from 'modules/pace/components/tasks/TaskAccordionSection';
import TaskListingSkeleton from 'modules/pace/components/tasks/TaskListingSkeleton';
import { useMockTaskCounts } from 'modules/pace/components/tasks/useTaskListingMockData';

interface TaskAccordionGroupProps {
  activeTab: TaskListingTab;
  search?: string;
}

const TaskAccordionGroup: FC<TaskAccordionGroupProps> = ({ activeTab, search }) => {
  const { data: countsData, isLoading } = useMockTaskCounts(search);

  const countMap = useMemo(() => {
    const map = new Map<TaskStatus, number>();

    countsData?.counts.forEach(({ status, count }) => {
      map.set(status, count);
    });

    return map;
  }, [countsData]);

  const visibleStatuses = useMemo(() => {
    const allowedStatuses = activeTab === TASK_LISTING_TAB.NEEDS_ACTION ? NEEDS_ACTION_STATUSES : STATUS_DISPLAY_ORDER;

    return allowedStatuses.filter((status) => (countMap.get(status) ?? 0) > 0);
  }, [activeTab, countMap]);

  const defaultOpenValue = useMemo(() => visibleStatuses[0], [visibleStatuses]);

  if (isLoading) {
    return <TaskListingSkeleton />;
  }

  if (visibleStatuses.length === 0) {
    return (
      <div className='flex flex-1 items-center justify-center py-20'>
        <div className='text-center'>
          <p className='f-14-450 text-GRAY_700'>No tasks found</p>
          <p className='f-12-400 text-GRAY_500 mt-1'>
            {search ? 'Try adjusting your search query' : 'Tasks will appear here when created'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Accordion
      type='single'
      defaultValue={defaultOpenValue}
      collapsible
      className='flex-1 overflow-y-auto [scrollbar-width:thin]'
    >
      {visibleStatuses.map((status) => (
        <TaskAccordionSection key={status} status={status} count={countMap.get(status) ?? 0} search={search} />
      ))}
    </Accordion>
  );
};

export default TaskAccordionGroup;
