import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import type { TaskStatus } from '@zamp-platform/chat';
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { STATUS_DISPLAY_ORDER, TASKS_PAGE_SIZE } from 'modules/pace/components/tasks/task-listing.constants';
import { parseIntSafely } from 'modules/process/process.utils';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useGetTaskCountsQuery,
  useGetTasksByStatusQuery,
  useLazyGetTaskCountsQuery,
  useLazyGetTasksByStatusQuery,
} from '@/apis/task';
import { useEventBus } from '@/app/_providers/sse-provider';
import { getChatTaskRoute } from '@/constants/routeConfig';
import type { TaskListItem } from '@/modules/pace/components/tasks/task-listing.types';
import type { MapAny } from '@/types/commonTypes';

export const useTaskNavigation = (taskId?: string) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawUrlIndex = parseIntSafely(searchParams?.get('currentIndex'), 0);
  const urlIndex = rawUrlIndex > 0 ? rawUrlIndex - 1 : -1;
  const urlTotal = parseIntSafely(searchParams?.get('totalRows'), 0);
  const status = searchParams?.get('status') as TaskStatus | null;
  const conversationId = searchParams?.get('s') ?? undefined;

  const currentPage = useMemo(() => {
    return urlIndex !== -1 ? Math.floor(urlIndex / TASKS_PAGE_SIZE) + 1 : 1;
  }, [urlIndex]);

  const { data: initialData, isLoading: isInitialLoading } = useGetTasksByStatusQuery(
    { status: status!, page: currentPage, limit: TASKS_PAGE_SIZE },
    {
      skip: urlIndex === -1 || urlTotal === 0 || !status,
      refetchOnMountOrArgChange: false,
    },
  );

  const [triggerFetchPage, { isLoading: isLoadingOtherPage }] = useLazyGetTasksByStatusQuery();
  const [triggerFetchCounts] = useLazyGetTaskCountsQuery();

  const { data: countsData, isLoading: isCountsLoading } = useGetTaskCountsQuery(undefined, {
    skip: urlIndex === -1 || !status,
  });

  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [liveStatus, setLiveStatus] = useState<TaskStatus | null>(null);

  useEffect(() => {
    setLiveStatus(null);
  }, [taskId]);

  useEffect(() => {
    if (urlIndex !== -1 || !taskId) return;

    let cancelled = false;

    setIsBootstrapping(true);

    const bootstrap = async () => {
      let found = false;

      try {
        const { data: counts } = await triggerFetchCounts();

        if (!counts || cancelled) return;

        const currentParams = new URLSearchParams(window.location.search);
        const urlTitle = currentParams.get('title') ?? undefined;
        const urlConversationId = currentParams.get('s') ?? undefined;

        for (const { status: s, count } of counts.counts) {
          if (count === 0 || cancelled) continue;

          const totalPages = Math.ceil(count / TASKS_PAGE_SIZE);

          for (let page = 1; page <= totalPages && !cancelled; page++) {
            const { data } = await triggerFetchPage({ status: s, page, limit: TASKS_PAGE_SIZE });

            if (cancelled) return;

            const idxInPage = data?.tasks?.findIndex((t) => t.id === taskId) ?? -1;

            if (idxInPage !== -1) {
              const absoluteIndex = (page - 1) * TASKS_PAGE_SIZE + idxInPage;

              found = true;

              router.replace(
                getChatTaskRoute({
                  taskId,
                  conversationId: urlConversationId,
                  taskTitle: urlTitle,
                  status: s,
                  currentIndex: absoluteIndex,
                  totalRows: count,
                }),
              );

              return;
            }
          }
        }
      } catch (err) {
        captureException(err);
      } finally {
        if (!found && !cancelled) setIsBootstrapping(false);
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
      setIsBootstrapping(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, urlIndex]);

  const liveTotal = useMemo(() => {
    if (!status || !countsData) return undefined;

    return countsData.counts.find((c) => c.status === status)?.count;
  }, [status, countsData]);

  const effectiveTotal = liveTotal ?? urlTotal;

  const statusCountMap = useMemo(() => {
    const map = new Map<TaskStatus, number>();

    countsData?.counts.forEach(({ status: s, count }) => {
      map.set(s, count);
    });

    return map;
  }, [countsData]);

  const nextStatus = useMemo(() => {
    if (!status) return null;

    const currentIdx = STATUS_DISPLAY_ORDER.indexOf(status);

    if (currentIdx === -1) return null;

    for (let i = currentIdx + 1; i < STATUS_DISPLAY_ORDER.length; i++) {
      const s = STATUS_DISPLAY_ORDER[i];

      if ((statusCountMap.get(s) ?? 0) > 0) return s;
    }

    return null;
  }, [status, statusCountMap]);

  const previousStatus = useMemo(() => {
    if (!status) return null;

    const currentIdx = STATUS_DISPLAY_ORDER.indexOf(status);

    if (currentIdx === -1) return null;

    for (let i = currentIdx - 1; i >= 0; i--) {
      const s = STATUS_DISPLAY_ORDER[i];

      if ((statusCountMap.get(s) ?? 0) > 0) return s;
    }

    return null;
  }, [status, statusCountMap]);

  const taskIdRef = useRef<string | undefined>(taskId);

  taskIdRef.current = taskId;
  const urlIndexRef = useRef(urlIndex);

  urlIndexRef.current = urlIndex;
  const statusRef = useRef<TaskStatus | null>(status);

  statusRef.current = status;
  const nextStatusRef = useRef<TaskStatus | null>(null);

  nextStatusRef.current = nextStatus;
  const conversationIdRef = useRef<string | undefined>(conversationId);

  conversationIdRef.current = conversationId;

  const { sseEventBus } = useEventBus();

  const fetchPageTasks = useCallback(
    async (pageNumber: number, fetchStatus?: TaskStatus): Promise<TaskListItem[]> => {
      const targetStatus = fetchStatus ?? status;

      if (!targetStatus) return [];

      try {
        const { data } = await triggerFetchPage({ status: targetStatus, page: pageNumber, limit: TASKS_PAGE_SIZE });

        return data?.tasks || [];
      } catch (err) {
        captureException(err);

        return [];
      }
    },
    [status, triggerFetchPage],
  );

  useEffect(() => {
    if (liveTotal === undefined || liveTotal === urlTotal || urlIndex === -1) return;

    const params = new URLSearchParams(window.location.search);

    params.set('totalRows', String(liveTotal));
    router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  }, [liveTotal, urlTotal, urlIndex, router]);

  useEffect(() => {
    if (urlIndex === -1 || !taskId || !status) return;

    let cancelled = false;

    const handleTaskStatusChange = async (data: BaseEventPayload) => {
      const payload = data.payload as MapAny;
      const updatedTaskId = payload?.task_id as string;
      const newStatus = (payload?.updated_fields as MapAny)?.status as TaskStatus | undefined;

      if (updatedTaskId !== taskIdRef.current || !newStatus) return;

      setLiveStatus(newStatus);

      if (newStatus === statusRef.current) return;

      const currentIndex = urlIndexRef.current;
      const currentStatus = statusRef.current!;

      try {
        const pageNumber = Math.floor(currentIndex / TASKS_PAGE_SIZE) + 1;
        const { data: pageData } = await triggerFetchPage({
          status: currentStatus,
          page: pageNumber,
          limit: TASKS_PAGE_SIZE,
        });

        if (cancelled) return;

        const newTotal = pageData?.count ?? 0;

        if (newTotal <= 0) {
          const ns = nextStatusRef.current;

          if (!ns) return;

          const { data: freshCounts } = await triggerFetchCounts();

          if (cancelled) return;

          const nsTotal = freshCounts?.counts.find((c) => c.status === ns)?.count ?? 0;

          if (nsTotal === 0) return;

          const tasks = await fetchPageTasks(1, ns);

          if (cancelled) return;

          const targetTask = tasks[0];

          if (targetTask) {
            router.replace(
              getChatTaskRoute({
                taskId: targetTask.id,
                conversationId: conversationIdRef.current,
                taskTitle: targetTask.title,
                status: ns,
                currentIndex: 0,
                totalRows: nsTotal,
              }),
            );
          }

          return;
        }

        const targetIndex = Math.min(currentIndex, newTotal - 1);
        const targetPage = Math.floor(targetIndex / TASKS_PAGE_SIZE) + 1;
        const pageTasks =
          targetPage === pageNumber ? (pageData?.tasks ?? []) : await fetchPageTasks(targetPage, currentStatus);

        if (cancelled) return;

        const targetTask = pageTasks[targetIndex % TASKS_PAGE_SIZE];

        if (targetTask) {
          router.replace(
            getChatTaskRoute({
              taskId: targetTask.id,
              conversationId: conversationIdRef.current,
              taskTitle: targetTask.title,
              status: currentStatus,
              currentIndex: targetIndex,
              totalRows: newTotal,
            }),
          );
        }
      } catch (err) {
        captureException(err);
      }
    };

    const sub = sseEventBus.subscribe(EVENT_TYPE.TASK_UPDATE, handleTaskStatusChange);

    return () => {
      cancelled = true;
      sub.unsubscribe();
    };
    // fetchPageTasks is intentionally excluded from deps to avoid re-subscribing on status changes;
    // status is already in the dep array and fetchPageTasks uses the current status via closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId, urlIndex, status]);

  const navigateToTask = useCallback(
    async (direction: 'next' | 'previous') => {
      const currentIndex = urlIndex;
      const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

      if (direction === 'next' && targetIndex >= effectiveTotal) {
        if (!nextStatus) return;

        const nextStatusTotal = statusCountMap.get(nextStatus) ?? 0;

        if (nextStatusTotal === 0) return;

        const tasks = await fetchPageTasks(1, nextStatus);
        const targetTask = tasks[0];

        if (!targetTask) return;

        router.replace(
          getChatTaskRoute({
            taskId: targetTask.id,
            conversationId,
            taskTitle: targetTask.title,
            status: nextStatus,
            currentIndex: 0,
            totalRows: nextStatusTotal,
          }),
        );

        return;
      }

      if (direction === 'previous' && targetIndex < 0) {
        if (!previousStatus) return;

        const prevStatusTotal = statusCountMap.get(previousStatus) ?? 0;

        if (prevStatusTotal === 0) return;

        const lastIndex = prevStatusTotal - 1;
        const tasks = await fetchPageTasks(Math.floor(lastIndex / TASKS_PAGE_SIZE) + 1, previousStatus);
        const targetTask = tasks[lastIndex % TASKS_PAGE_SIZE];

        if (!targetTask) return;

        router.replace(
          getChatTaskRoute({
            taskId: targetTask.id,
            conversationId,
            taskTitle: targetTask.title,
            status: previousStatus,
            currentIndex: lastIndex,
            totalRows: prevStatusTotal,
          }),
        );

        return;
      }

      if (targetIndex < 0 || targetIndex >= effectiveTotal) return;

      const currentPageStart = Math.floor(currentIndex / TASKS_PAGE_SIZE) * TASKS_PAGE_SIZE;
      const isSamePage = targetIndex >= currentPageStart && targetIndex < currentPageStart + TASKS_PAGE_SIZE;
      const indexInPage = targetIndex % TASKS_PAGE_SIZE;

      let tasks: TaskListItem[] = [];

      if (isSamePage && initialData?.tasks?.length) {
        tasks = initialData.tasks;
      } else {
        tasks = await fetchPageTasks(Math.floor(targetIndex / TASKS_PAGE_SIZE) + 1);
      }

      const targetTask = tasks[indexInPage];

      if (!targetTask) return;

      const route = getChatTaskRoute({
        taskId: targetTask.id,
        conversationId,
        taskTitle: targetTask.title,
        status: status || undefined,
        currentIndex: targetIndex,
        totalRows: effectiveTotal,
      });

      router.replace(route);
    },
    [
      initialData,
      router,
      status,
      urlIndex,
      effectiveTotal,
      fetchPageTasks,
      nextStatus,
      previousStatus,
      statusCountMap,
      conversationId,
    ],
  );

  return {
    currentIndex: urlIndex,
    totalCount: effectiveTotal,
    status: liveStatus ?? status,
    hasNext: urlIndex !== -1 && (urlIndex < effectiveTotal - 1 || !!nextStatus || isCountsLoading),
    hasPrevious: urlIndex > 0 || (urlIndex === 0 && (!!previousStatus || isCountsLoading)),
    isLoading: isInitialLoading || isLoadingOtherPage,
    isBootstrapping,
    goToNextTask: () => navigateToTask('next'),
    goToPreviousTask: () => navigateToTask('previous'),
  };
};
