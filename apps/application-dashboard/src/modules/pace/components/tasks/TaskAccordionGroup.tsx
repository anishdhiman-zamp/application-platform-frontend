'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TaskStatus } from '@zamp-platform/chat';
import { Accordion } from '@zamp-platform/ui';
import {
  NEEDS_ACTION_STATUSES,
  STATUS_DISPLAY_ORDER,
  VALID_TABS,
} from 'modules/pace/components/tasks/task-listing.constants';
import { TASK_LISTING_TAB, type TaskListingTab } from 'modules/pace/components/tasks/task-listing.types';
import TaskAccordionSection from 'modules/pace/components/tasks/TaskAccordionSection';
import TaskListingSkeleton from 'modules/pace/components/tasks/TaskListingSkeleton';
import { useSearchParams } from 'next/navigation';
import { useGetTaskCountsQuery } from '@/apis/task';
import ProcessEmptyState from '@/modules/process/activity-runs/components/ProcessEmptyState';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

interface TaskAccordionGroupProps {
  search?: string;
}

const NoDataBanner = ({ search }: { search?: string }) => (
  <ProcessEmptyState
    title='No tasks found'
    description={search ? 'Try adjusting your search query' : 'Tasks will appear here when created'}
  />
);

const TaskAccordionGroup = ({ search }: TaskAccordionGroupProps) => {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');
  const activeTab: TaskListingTab =
    tabParam && VALID_TABS.has(tabParam) ? (tabParam as TaskListingTab) : TASK_LISTING_TAB.ALL;

  const { data: countsData, isLoading, isFetching } = useGetTaskCountsQuery(search ? { search } : undefined);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const prevCountsRef = useRef(countsData);

  const effectiveCountsData = countsData ?? prevCountsRef.current;

  const countMap = useMemo(() => {
    const map = new Map<TaskStatus, number>();

    effectiveCountsData?.counts.forEach(({ status, count }) => {
      map.set(status, count);
    });

    return map;
  }, [effectiveCountsData]);

  const visibleStatuses = useMemo(() => {
    const allowedStatuses = activeTab === TASK_LISTING_TAB.NEEDS_ACTION ? NEEDS_ACTION_STATUSES : STATUS_DISPLAY_ORDER;

    return allowedStatuses.filter((status) => (countMap.get(status) ?? 0) > 0);
  }, [activeTab, countMap]);

  const openValuesRef = useRef<string[]>([...visibleStatuses]);

  useEffect(() => {
    openValuesRef.current = [...visibleStatuses];
  }, [visibleStatuses]);

  useEffect(() => {
    if (countsData) {
      prevCountsRef.current = countsData;
      setHasLoadedOnce(true);
    }
  }, [countsData]);

  const handleValueChange = useCallback(
    (newValues: string[]) => {
      const prevValues = openValuesRef.current;

      openValuesRef.current = newValues;

      const closedValue = prevValues.find((v) => !newValues.includes(v));

      if (!closedValue) return;

      const container = scrollContainerRef.current;

      if (!container) return;

      const closedIndex = visibleStatuses.indexOf(closedValue as TaskStatus);
      const items = container.querySelectorAll<HTMLElement>('[data-slot="accordion-item"]');
      const closedItem = items[closedIndex];

      if (!closedItem) return;

      const containerRect = container.getBoundingClientRect();
      const itemRect = closedItem.getBoundingClientRect();

      container.scrollTo({
        top: itemRect.top - containerRect.top + container.scrollTop,
      });
    },
    [visibleStatuses],
  );

  return (
    <CommonWrapper
      isLoading={isLoading && !hasLoadedOnce}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<TaskListingSkeleton />}
      isNoData={!isFetching && visibleStatuses.length === 0}
      noDataBanner={<NoDataBanner search={search} />}
      className='flex min-h-0 flex-1 flex-col'
      disableAnimation
    >
      <Accordion
        key={visibleStatuses.join(',')}
        ref={scrollContainerRef}
        type='multiple'
        defaultValue={[...visibleStatuses]}
        className='flex-1 overflow-y-auto [scrollbar-width:thin]'
        onValueChange={handleValueChange}
      >
        {visibleStatuses.map((status) => (
          <TaskAccordionSection
            key={status}
            status={status}
            count={countMap.get(status) ?? 0}
            search={search}
            scrollContainerRef={scrollContainerRef}
          />
        ))}
      </Accordion>
    </CommonWrapper>
  );
};

export default TaskAccordionGroup;
