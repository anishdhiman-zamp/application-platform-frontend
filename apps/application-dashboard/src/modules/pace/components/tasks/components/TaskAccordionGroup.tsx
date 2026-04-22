'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TASK_STATUS, type TaskStatus } from '@zamp-platform/chat';
import { Accordion } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { usePathname, useSearchParams } from 'next/navigation';
import { useGetAgentTaskCountsQuery } from '@/apis/agents';
import { useGetTaskCountsQuery } from '@/apis/task';
import { useEventBus } from '@/app/_providers/sse-provider';
import TaskAccordionSection from '@/modules/pace/components/tasks/components/TaskAccordionSection';
import {
  NEEDS_ACTION_STATUSES,
  STATUS_DISPLAY_ORDER,
  VALID_TABS,
} from '@/modules/pace/components/tasks/constants/tasks.constants';
import TaskListingSkeleton from '@/modules/pace/components/tasks/loaders/TaskListingSkeleton';
import {
  type CreationSource,
  TASK_LISTING_TAB,
  type TaskListingTab,
} from '@/modules/pace/components/tasks/types/tasks.types';
import { getAccordionStorageKey, readStoredAccordionValues } from '@/modules/pace/components/tasks/utils/tasks.utils';
import ProcessEmptyState from '@/modules/process/activity-runs/components/ProcessEmptyState';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';

interface TaskAccordionGroupProps {
  search?: string;
  agentId?: string;
  isActive?: boolean;
  skipFetch?: boolean;
  creationSource?: CreationSource;
}

const NoDataBanner = ({ search }: { search?: string }) => (
  <div className='flex flex-1 items-center justify-center [&>div]:min-h-0'>
    <ProcessEmptyState
      title='No tasks found'
      description={search ? 'Try adjusting your search query' : 'Tasks will appear here when created'}
    />
  </div>
);

const TaskAccordionGroup = ({
  search,
  agentId,
  isActive = true,
  skipFetch = false,
  creationSource,
}: TaskAccordionGroupProps) => {
  const hasBeenActiveRef = useRef(isActive);
  const isFirstVisit = !hasBeenActiveRef.current && isActive;

  if (isActive) hasBeenActiveRef.current = true;

  const shouldSkip = !hasBeenActiveRef.current || skipFetch;

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { sseEventBus } = useEventBus();

  // When tasks are viewed from an agent detail page, pass the current URL as referrer
  const referrer = useMemo(() => {
    if (!agentId || !pathname) return undefined;
    const query = searchParams?.toString();

    return query ? `${pathname}?${query}` : pathname;
  }, [agentId, pathname, searchParams]);
  const tabParam = searchParams?.get('tab');
  const activeTab: TaskListingTab =
    tabParam && VALID_TABS.has(tabParam) ? (tabParam as TaskListingTab) : TASK_LISTING_TAB.ALL;

  const globalCountsResult = useGetTaskCountsQuery(
    search || creationSource
      ? {
          search: search || undefined,
          creation_source_type: creationSource?.type,
          creation_source_id: creationSource?.id,
        }
      : undefined,
    { skip: !!agentId || shouldSkip },
  );

  const agentCountsResult = useGetAgentTaskCountsQuery(
    { agentId: agentId!, search: search || undefined },
    { skip: !agentId || shouldSkip },
  );

  const {
    data: countsData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = agentId ? agentCountsResult : globalCountsResult;

  // eslint-disable-next-line react-hooks/exhaustive-deps -- isFirstVisit reads a ref; refetch is a stable RTK identity
  useEffect(() => {
    if (isActive && !isFirstVisit && !skipFetch) refetch();
  }, [isActive, skipFetch]);

  // Directly refetch counts on any task SSE event so the visible status set
  // (which is driven by `countMap`) stays in sync with the backend while the
  // user is looking at this view.
  useEffect(() => {
    if (!isActive || skipFetch) return;

    const taskSub = sseEventBus.subscribe(EVENT_TYPE.TASK, () => refetch());
    const taskUpdateSub = sseEventBus.subscribe(EVENT_TYPE.TASK_UPDATE, () => refetch());

    return () => {
      taskSub.unsubscribe();
      taskUpdateSub.unsubscribe();
    };
  }, [isActive, skipFetch, sseEventBus, refetch]);

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

  const storageKey = getAccordionStorageKey(agentId, creationSource, activeTab);

  const openValuesRef = useRef<string[]>(readStoredAccordionValues(storageKey) ?? [TASK_STATUS.COMPLETED]);
  const prevStorageKeyRef = useRef(storageKey);

  if (prevStorageKeyRef.current !== storageKey) {
    prevStorageKeyRef.current = storageKey;
    openValuesRef.current = readStoredAccordionValues(storageKey) ?? [TASK_STATUS.COMPLETED];
  }

  const handleValueChange = useCallback(
    (newValues: string[]) => {
      const prevValues = openValuesRef.current;

      openValuesRef.current = newValues;

      try {
        sessionStorage.setItem(storageKey, JSON.stringify(newValues));
      } catch {
        // sessionStorage unavailable (private browsing quota, etc.) — silently ignore
      }

      const closedValue = prevValues.find((v) => !newValues.includes(v));

      if (!closedValue) return;

      const container = scrollContainerRef.current;

      if (!container) return;

      const closedIndex = visibleStatuses.indexOf(closedValue as TaskStatus);
      const items = container.querySelectorAll<HTMLElement>('[data-slot="accordion-item"]');
      const closedItem = items[closedIndex];

      if (!closedItem) return;

      if (closedItem.offsetTop > container.scrollTop) return;

      const containerRect = container.getBoundingClientRect();
      const itemRect = closedItem.getBoundingClientRect();

      container.scrollTo({
        top: itemRect.top - containerRect.top + container.scrollTop,
      });
    },
    [visibleStatuses, storageKey],
  );

  useEffect(() => {
    const stored = readStoredAccordionValues(storageKey);

    openValuesRef.current = stored ?? [...visibleStatuses];
  }, [visibleStatuses, storageKey]);

  useEffect(() => {
    if (countsData) {
      prevCountsRef.current = countsData;
      setHasLoadedOnce(true);
    }
  }, [countsData]);

  return (
    <CommonWrapper
      isLoading={(isLoading || skipFetch) && !hasLoadedOnce}
      isError={isError}
      refetchFunction={refetch}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<TaskListingSkeleton />}
      isNoData={!isFetching && !skipFetch && visibleStatuses.length === 0}
      noDataBanner={<NoDataBanner search={search} />}
      className={cn(
        'flex min-h-0 flex-col',
        agentId
          ? ['border-GRAY_400 overflow-hidden rounded-xl border', visibleStatuses.length === 0 && 'flex-1']
          : 'flex-1',
      )}
      disableAnimation
    >
      <Accordion
        key={visibleStatuses.join(',')}
        ref={scrollContainerRef}
        type='multiple'
        defaultValue={openValuesRef.current}
        className='overflow-y-auto [scrollbar-width:thin] [&_[data-slot=accordion-item]:last-child]:border-b-0'
        onValueChange={handleValueChange}
      >
        {visibleStatuses.map((status) => (
          <TaskAccordionSection
            key={status}
            status={status}
            count={countMap.get(status) ?? 0}
            search={search}
            agentId={agentId}
            scrollContainerRef={scrollContainerRef}
            creationSource={creationSource}
            referrer={referrer}
          />
        ))}
      </Accordion>
    </CommonWrapper>
  );
};

export default TaskAccordionGroup;
