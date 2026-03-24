'use client';

import { useMemo } from 'react';
import type { TaskStatus } from '@zamp-platform/chat';
import { Accordion } from '@zamp-platform/ui';
import { NEEDS_ACTION_STATUSES, STATUS_DISPLAY_ORDER } from 'modules/pace/components/tasks/task-listing.constants';
import { TASK_LISTING_TAB, type TaskListingTab } from 'modules/pace/components/tasks/task-listing.types';
import TaskAccordionSection from 'modules/pace/components/tasks/TaskAccordionSection';
import TaskListingSkeleton from 'modules/pace/components/tasks/TaskListingSkeleton';
import { useGetTaskCountsQuery } from '@/apis/task';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

interface TaskAccordionGroupProps {
  activeTab: TaskListingTab;
  search?: string;
}

const NoDataBanner = ({ search }: { search?: string }) => (
  <div className='flex flex-1 items-center justify-center py-20'>
    <div className='text-center'>
      <p className='f-14-450 text-GRAY_700'>No tasks found</p>
      <p className='f-12-400 text-GRAY_500 mt-1'>
        {search ? 'Try adjusting your search query' : 'Tasks will appear here when created'}
      </p>
    </div>
  </div>
);

const TaskAccordionGroup = ({ activeTab, search }: TaskAccordionGroupProps) => {
  const { data: countsData, isLoading } = useGetTaskCountsQuery();

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

  return (
    <CommonWrapper
      isLoading={isLoading}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<TaskListingSkeleton />}
      isNoData={!isLoading && visibleStatuses.length === 0}
      noDataBanner={<NoDataBanner search={search} />}
      className='flex-1'
      disableAnimation
    >
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
    </CommonWrapper>
  );
};

export default TaskAccordionGroup;
