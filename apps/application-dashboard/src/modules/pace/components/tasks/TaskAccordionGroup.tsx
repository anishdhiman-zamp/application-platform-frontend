'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { TaskStatus } from '@zamp-platform/chat';
import { Accordion } from '@zamp-platform/ui';
import { NEEDS_ACTION_STATUSES, STATUS_DISPLAY_ORDER } from 'modules/pace/components/tasks/task-listing.constants';
import { TASK_LISTING_TAB, type TaskListingTab } from 'modules/pace/components/tasks/task-listing.types';
import TaskAccordionSection from 'modules/pace/components/tasks/TaskAccordionSection';
import TaskListingSkeleton from 'modules/pace/components/tasks/TaskListingSkeleton';
import { useGetTaskCountsQuery } from '@/apis/task';
import ProcessEmptyState from '@/modules/process/activity-runs/components/ProcessEmptyState';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

export type ScrollCallback = (container: HTMLDivElement) => void;

interface TaskAccordionGroupProps {
  activeTab: TaskListingTab;
  search?: string;
}

const NoDataBanner = ({ search }: { search?: string }) => (
  <ProcessEmptyState
    title='No tasks found'
    description={search ? 'Try adjusting your search query' : 'Tasks will appear here when created'}
  />
);

const TaskAccordionGroup = ({ activeTab, search }: TaskAccordionGroupProps) => {
  const { data: countsData, isLoading } = useGetTaskCountsQuery(search ? { search } : undefined);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollCallbacksRef = useRef(new Set<ScrollCallback>());

  const registerScrollCallback = useCallback((cb: ScrollCallback) => {
    scrollCallbacksRef.current.add(cb);

    return () => {
      scrollCallbacksRef.current.delete(cb);
    };
  }, []);

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

  useEffect(() => {
    const el = scrollContainerRef.current;

    if (!el) return;

    const onScroll = () => scrollCallbacksRef.current.forEach((cb) => cb(el));

    el.addEventListener('scroll', onScroll, { passive: true });

    return () => el.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reattach when accordion remounts via key
  }, [visibleStatuses]);

  return (
    <CommonWrapper
      isLoading={isLoading}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<TaskListingSkeleton />}
      isNoData={!isLoading && visibleStatuses.length === 0}
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
      >
        {visibleStatuses.map((status) => (
          <TaskAccordionSection
            key={status}
            status={status}
            count={countMap.get(status) ?? 0}
            search={search}
            registerScrollCallback={registerScrollCallback}
          />
        ))}
      </Accordion>
    </CommonWrapper>
  );
};

export default TaskAccordionGroup;
