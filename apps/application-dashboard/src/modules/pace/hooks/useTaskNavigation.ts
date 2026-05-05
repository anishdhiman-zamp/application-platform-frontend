import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { captureException } from '@sentry/browser';
import type { SiblingTask, TaskBreadcrumb, TaskStatus } from '@zamp-platform/chat';
import { extractTaskUpdateFields } from '@zamp-platform/utils';
import { type BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { parseIntSafely } from 'modules/process/process.utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  useGetTaskCountsQuery,
  useGetTasksByStatusQuery,
  useLazyGetTaskCountsQuery,
  useLazyGetTasksByStatusQuery,
} from '@/apis/task';
import { useEventBus } from '@/app/_providers/sse-provider';
import { getChatTaskRoute, ROUTES_PATH, TASK_QUERY_PARAMS } from '@/constants/routeConfig';
import { STATUS_DISPLAY_ORDER, TASKS_PAGE_SIZE } from '@/modules/pace/components/tasks/constants/tasks.constants';
import type { CreationSource, TaskListItem } from '@/modules/pace/components/tasks/types/tasks.types';
import { markNavAsReplace } from '@/modules/pace/hooks/useTabRouter';

interface UseTaskNavigationOptions {
  creationSource?: CreationSource;
}

export const useTaskNavigation = (taskId?: string, options?: UseTaskNavigationOptions) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const inChat = pathname === ROUTES_PATH.CHAT;

  // Wrapper that signals the tab system to update the active tab in-place
  // (pagination) rather than creating a new tab.
  const replaceRoute = useCallback(
    (url: string, opts?: { scroll?: boolean }) => {
      markNavAsReplace();
      router.replace(url, opts);
    },
    [router],
  );

  const rawUrlIndex = parseIntSafely(searchParams?.get('currentIndex'), 0);
  const urlIndex = rawUrlIndex > 0 ? rawUrlIndex - 1 : -1;
  const urlTotal = parseIntSafely(searchParams?.get('totalRows'), 0);
  const status = searchParams?.get('status') as TaskStatus | null;
  const conversationId = searchParams?.get('s') ?? undefined;

  // Build creation source API params for scoping task queries
  const sourceParams = useMemo(
    () =>
      options?.creationSource
        ? {
            creation_source_type: options.creationSource.type,
            creation_source_id: options.creationSource.id,
          }
        : {},
    [options?.creationSource],
  );

  const currentPage = useMemo(() => {
    return urlIndex !== -1 ? Math.floor(urlIndex / TASKS_PAGE_SIZE) + 1 : 1;
  }, [urlIndex]);

  const { data: initialData, isLoading: isInitialLoading } = useGetTasksByStatusQuery(
    { status: status!, page: currentPage, limit: TASKS_PAGE_SIZE, ...sourceParams },
    {
      skip: urlIndex === -1 || urlTotal === 0 || !status,
      refetchOnMountOrArgChange: false,
    },
  );

  const [triggerFetchPage, { isLoading: isLoadingOtherPage }] = useLazyGetTasksByStatusQuery();
  const [triggerFetchCounts] = useLazyGetTaskCountsQuery();

  const { data: countsData, isLoading: isCountsLoading } = useGetTaskCountsQuery(
    Object.keys(sourceParams).length > 0 ? sourceParams : undefined,
    {
      skip: urlIndex === -1 || !status,
      refetchOnMountOrArgChange: false,
    },
  );

  const [isBootstrapping, setIsBootstrapping] = useState(false);
  const [liveStatus, setLiveStatus] = useState<TaskStatus | null>(null);
  const [liveSubtaskStatuses, setLiveSubtaskStatuses] = useState<Map<string, TaskStatus>>(new Map());

  useEffect(() => {
    setLiveStatus(null);
    setLiveSubtaskStatuses(new Map());
  }, [taskId]);

  const handleBootstrap = useCallback(
    async (bootstrapTaskId: string, signal: { cancelled: boolean }) => {
      let found = false;

      try {
        const { data: counts } = await triggerFetchCounts(
          Object.keys(sourceParams).length > 0 ? sourceParams : undefined,
        );

        if (!counts || signal.cancelled) return;

        const currentParams = new URLSearchParams(window.location.search);
        const urlTitle = currentParams.get('title') ?? undefined;
        const urlConversationId = currentParams.get('s') ?? undefined;

        for (const { status: s, count } of counts.counts) {
          if (count === 0 || signal.cancelled) continue;

          const totalPages = Math.ceil(count / TASKS_PAGE_SIZE);

          for (let page = 1; page <= totalPages && !signal.cancelled; page++) {
            const { data } = await triggerFetchPage({ status: s, page, limit: TASKS_PAGE_SIZE, ...sourceParams });

            if (signal.cancelled) return;

            const idxInPage = data?.tasks?.findIndex((t) => t.id === bootstrapTaskId) ?? -1;

            if (idxInPage !== -1) {
              const absoluteIndex = (page - 1) * TASKS_PAGE_SIZE + idxInPage;

              found = true;

              replaceRoute(
                getChatTaskRoute({
                  taskId: bootstrapTaskId,
                  conversationId: urlConversationId,
                  taskTitle: urlTitle,
                  status: s,
                  currentIndex: absoluteIndex,
                  totalRows: count,
                  inChat,
                }),
              );

              return;
            }
          }
        }
      } catch (err) {
        captureException(err);
      } finally {
        if (!found && !signal.cancelled) setIsBootstrapping(false);
      }
    },
    [triggerFetchCounts, triggerFetchPage, sourceParams, replaceRoute, inChat],
  );

  useEffect(() => {
    if (urlIndex !== -1 || !taskId) return;

    const signal = { cancelled: false };

    setIsBootstrapping(true);
    handleBootstrap(taskId, signal);

    return () => {
      signal.cancelled = true;
      setIsBootstrapping(false);
    };
  }, [taskId, urlIndex, handleBootstrap]);

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
  const statusRef = useRef<TaskStatus | null>(status);

  statusRef.current = status;
  const conversationIdRef = useRef<string | undefined>(conversationId);

  conversationIdRef.current = conversationId;

  const { sseEventBus } = useEventBus();

  const fetchPageTasks = useCallback(
    async (pageNumber: number, fetchStatus?: TaskStatus): Promise<TaskListItem[]> => {
      const targetStatus = fetchStatus ?? status;

      if (!targetStatus) return [];

      try {
        const { data } = await triggerFetchPage({
          status: targetStatus,
          page: pageNumber,
          limit: TASKS_PAGE_SIZE,
          ...sourceParams,
        });

        return data?.tasks || [];
      } catch (err) {
        captureException(err);

        return [];
      }
    },
    [status, triggerFetchPage, sourceParams],
  );

  // Sync liveStatus to URL param so reloads preserve the correct status.
  const handleUrlStatusSync = useCallback(() => {
    if (!liveStatus || !status || liveStatus === status) return;

    const currentParams = new URLSearchParams(window.location.search);

    currentParams.set('status', liveStatus);
    replaceRoute(`${window.location.pathname}?${currentParams.toString()}`, { scroll: false });
  }, [liveStatus, status, replaceRoute]);

  // When we have list-navigation context, also update the task's position
  // within the new status list after a status change.
  const handleTaskStatusNavigation = useCallback(
    async (data: BaseEventPayload, signal: { cancelled: boolean }) => {
      const { taskId: updatedTaskId, status: rawStatus } = extractTaskUpdateFields(data);
      const newStatus = rawStatus as TaskStatus | undefined;

      if (updatedTaskId !== taskIdRef.current || !newStatus) return;
      if (newStatus === statusRef.current) return;

      try {
        const { data: freshCounts } = await triggerFetchCounts(
          Object.keys(sourceParams).length > 0 ? sourceParams : undefined,
        );

        if (signal.cancelled) return;

        const newStatusCount = freshCounts?.counts.find((c) => c.status === newStatus)?.count ?? 0;

        if (newStatusCount === 0) return;

        let foundIndex: number | undefined = undefined;
        const totalPages = Math.ceil(newStatusCount / TASKS_PAGE_SIZE);

        for (let page = 1; page <= totalPages && !signal.cancelled; page++) {
          const { data: pageData } = await triggerFetchPage({
            status: newStatus,
            page,
            limit: TASKS_PAGE_SIZE,
            ...sourceParams,
          });

          if (signal.cancelled) return;

          const idxInPage = pageData?.tasks?.findIndex((t) => t.id === taskIdRef.current) ?? -1;

          if (idxInPage !== -1) {
            foundIndex = (page - 1) * TASKS_PAGE_SIZE + idxInPage;
            break;
          }
        }

        if (signal.cancelled || foundIndex === undefined) return;

        const currentParams = new URLSearchParams(window.location.search);
        const urlTitle = currentParams.get('title') ?? undefined;

        replaceRoute(
          getChatTaskRoute({
            taskId: taskIdRef.current!,
            conversationId: conversationIdRef.current,
            taskTitle: urlTitle,
            status: newStatus,
            currentIndex: foundIndex,
            totalRows: newStatusCount,
            inChat,
          }),
        );
      } catch (err) {
        captureException(err);
      }
    },
    [triggerFetchCounts, triggerFetchPage, sourceParams, replaceRoute, inChat],
  );

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

        const route = getChatTaskRoute({
          taskId: targetTask.id,
          conversationId,
          taskTitle: targetTask.title,
          status: nextStatus,
          currentIndex: 0,
          totalRows: nextStatusTotal,
          inChat,
        });

        replaceRoute(route);

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

        const route = getChatTaskRoute({
          taskId: targetTask.id,
          conversationId,
          taskTitle: targetTask.title,
          status: previousStatus,
          currentIndex: lastIndex,
          totalRows: prevStatusTotal,
          inChat,
        });

        replaceRoute(route);

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
        inChat,
      });

      replaceRoute(route);
    },
    [
      initialData,
      status,
      urlIndex,
      effectiveTotal,
      fetchPageTasks,
      nextStatus,
      previousStatus,
      statusCountMap,
      conversationId,
      router,
      replaceRoute,
      inChat,
    ],
  );

  const currentTask = useMemo(() => initialData?.tasks?.find((t) => t.id === taskId), [initialData, taskId]);

  // Merge SSE-updated subtask statuses with the API data
  const liveSubtasks = useMemo(() => {
    const base = currentTask?.subtasks ?? [];

    if (liveSubtaskStatuses.size === 0) return base;

    return base.map((s) => {
      const updatedStatus = liveSubtaskStatuses.get(s.id);

      return updatedStatus ? { ...s, status: updatedStatus } : s;
    });
  }, [currentTask?.subtasks, liveSubtaskStatuses]);

  const allSiblings: SiblingTask[] = useMemo(() => {
    const raw = searchParams?.get(TASK_QUERY_PARAMS.SIBLINGS);

    if (!raw) return [];

    try {
      return JSON.parse(raw) as SiblingTask[];
    } catch {
      return [];
    }
  }, [searchParams]);

  // Group siblings by status in display order
  const siblingsByStatus = useMemo(() => {
    const map = new Map<string, SiblingTask[]>();

    for (const s of allSiblings) {
      const list = map.get(s.status) ?? [];

      list.push(s);
      map.set(s.status, list);
    }

    return map;
  }, [allSiblings]);

  const statusSiblings = useMemo(
    () => (status ? (siblingsByStatus.get(status) ?? []) : []),
    [siblingsByStatus, status],
  );

  // Find next/previous status groups with items (for cross-status nav)
  const siblingNextStatus = useMemo(() => {
    if (!status) return null;

    const idx = STATUS_DISPLAY_ORDER.indexOf(status);

    if (idx === -1) return null;

    for (let i = idx + 1; i < STATUS_DISPLAY_ORDER.length; i++) {
      if ((siblingsByStatus.get(STATUS_DISPLAY_ORDER[i])?.length ?? 0) > 0) return STATUS_DISPLAY_ORDER[i];
    }

    return null;
  }, [status, siblingsByStatus]);

  const siblingPrevStatus = useMemo(() => {
    if (!status) return null;

    const idx = STATUS_DISPLAY_ORDER.indexOf(status);

    if (idx === -1) return null;

    for (let i = idx - 1; i >= 0; i--) {
      if ((siblingsByStatus.get(STATUS_DISPLAY_ORDER[i])?.length ?? 0) > 0) return STATUS_DISPLAY_ORDER[i];
    }

    return null;
  }, [status, siblingsByStatus]);

  const isSiblingNav = allSiblings.length > 0 && urlIndex !== -1 && status;

  const getParsedParentTasks = useCallback((): TaskBreadcrumb[] | undefined => {
    const raw = new URLSearchParams(window.location.search).get(TASK_QUERY_PARAMS.PARENT_TASKS);

    if (!raw) return undefined;

    try {
      const parsed = JSON.parse(raw) as TaskBreadcrumb[];

      return parsed.length > 0 ? parsed : undefined;
    } catch {
      return undefined;
    }
  }, []);

  const navigateToSibling = useCallback(
    (direction: 'next' | 'previous') => {
      const targetIndex = direction === 'next' ? urlIndex + 1 : urlIndex - 1;
      const parsedParentTasks = getParsedParentTasks();

      // Cross-status: next beyond current status group
      if (direction === 'next' && targetIndex >= statusSiblings.length) {
        if (!siblingNextStatus) return;

        const nextGroup = siblingsByStatus.get(siblingNextStatus) ?? [];
        const target = nextGroup[0];

        if (!target) return;

        const route = getChatTaskRoute({
          taskId: target.id,
          conversationId,
          taskTitle: target.title,
          status: target.status,
          currentIndex: 0,
          totalRows: nextGroup.length,
          parentTasks: parsedParentTasks,
          siblings: allSiblings,
          inChat,
        });

        replaceRoute(route);

        return;
      }

      // Cross-status: previous before current status group
      if (direction === 'previous' && targetIndex < 0) {
        if (!siblingPrevStatus) return;

        const prevGroup = siblingsByStatus.get(siblingPrevStatus) ?? [];
        const lastIndex = prevGroup.length - 1;
        const target = prevGroup[lastIndex];

        if (!target) return;

        const route = getChatTaskRoute({
          taskId: target.id,
          conversationId,
          taskTitle: target.title,
          status: target.status,
          currentIndex: lastIndex,
          totalRows: prevGroup.length,
          parentTasks: parsedParentTasks,
          siblings: allSiblings,
          inChat,
        });

        replaceRoute(route);

        return;
      }

      // Within same status group
      if (targetIndex < 0 || targetIndex >= statusSiblings.length) return;

      const target = statusSiblings[targetIndex];
      const route = getChatTaskRoute({
        taskId: target.id,
        conversationId,
        taskTitle: target.title,
        status: target.status,
        currentIndex: targetIndex,
        totalRows: statusSiblings.length,
        parentTasks: parsedParentTasks,
        siblings: allSiblings,
        inChat,
      });

      replaceRoute(route);
    },
    [
      urlIndex,
      statusSiblings,
      siblingsByStatus,
      siblingNextStatus,
      siblingPrevStatus,
      allSiblings,
      router,
      conversationId,
      getParsedParentTasks,
      replaceRoute,
      inChat,
    ],
  );

  useEffect(() => {
    if (liveTotal === undefined || liveTotal === urlTotal || urlIndex === -1) return;

    const params = new URLSearchParams(window.location.search);

    params.set('totalRows', String(liveTotal));
    replaceRoute(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  }, [liveTotal, urlTotal, urlIndex, router]);

  // Subscribe to SSE task updates for the current task and its subtasks.
  useEffect(() => {
    if (!taskId) return;

    const handleLiveStatusUpdate = (data: BaseEventPayload) => {
      const { taskId: updatedTaskId, status: rawStatus } = extractTaskUpdateFields(data);
      const newStatus = rawStatus as TaskStatus | undefined;

      if (!updatedTaskId || !newStatus) return;

      if (updatedTaskId === taskIdRef.current) {
        setLiveStatus(newStatus);

        return;
      }

      // Update subtask status in the live map
      setLiveSubtaskStatuses((prev) => {
        const next = new Map(prev);

        next.set(updatedTaskId, newStatus);

        return next;
      });
    };

    const sub = sseEventBus.subscribe(EVENT_TYPE.TASK_UPDATE, handleLiveStatusUpdate);

    return () => sub.unsubscribe();
  }, [taskId, sseEventBus]);

  useEffect(() => {
    handleUrlStatusSync();
  }, [handleUrlStatusSync]);

  useEffect(() => {
    if (urlIndex === -1 || !taskId || !status) return;

    const signal = { cancelled: false };

    const sub = sseEventBus.subscribe(EVENT_TYPE.TASK_UPDATE, (data: BaseEventPayload) => {
      handleTaskStatusNavigation(data, signal);
    });

    return () => {
      signal.cancelled = true;
      sub.unsubscribe();
    };
  }, [taskId, urlIndex, status, sseEventBus, handleTaskStatusNavigation]);

  // Sync subtask status changes to the siblings URL param so it stays fresh on reload/navigation.
  const handleSiblingsUrlSync = useCallback(() => {
    if (liveSubtaskStatuses.size === 0 || allSiblings.length === 0) return;

    const updated = allSiblings.map((s) => {
      const freshStatus = liveSubtaskStatuses.get(s.id);

      return freshStatus ? { ...s, status: freshStatus } : s;
    });

    if (JSON.stringify(updated) === JSON.stringify(allSiblings)) return;

    const currentParams = new URLSearchParams(window.location.search);

    currentParams.set(TASK_QUERY_PARAMS.SIBLINGS, JSON.stringify(updated));
    replaceRoute(`${window.location.pathname}?${currentParams.toString()}`, { scroll: false });
  }, [liveSubtaskStatuses, allSiblings, replaceRoute]);

  useEffect(() => {
    handleSiblingsUrlSync();
  }, [handleSiblingsUrlSync]);

  if (isSiblingNav) {
    return {
      currentIndex: urlIndex,
      totalCount: statusSiblings.length,
      status: liveStatus ?? status,
      liveStatus,
      subtasks: liveSubtasks,
      hasNext: urlIndex < statusSiblings.length - 1 || !!siblingNextStatus,
      hasPrevious: urlIndex > 0 || !!siblingPrevStatus,
      isLoading: false,
      isBootstrapping: false,
      goToNextTask: () => navigateToSibling('next'),
      goToPreviousTask: () => navigateToSibling('previous'),
    };
  }

  return {
    currentIndex: urlIndex,
    totalCount: effectiveTotal,
    status: liveStatus ?? status,
    liveStatus,
    subtasks: liveSubtasks,
    hasNext: urlIndex !== -1 && (urlIndex < effectiveTotal - 1 || !!nextStatus || isCountsLoading),
    hasPrevious: urlIndex > 0 || (urlIndex === 0 && (!!previousStatus || isCountsLoading)),
    isLoading: isInitialLoading || isLoadingOtherPage,
    isBootstrapping,
    goToNextTask: () => navigateToTask('next'),
    goToPreviousTask: () => navigateToTask('previous'),
  };
};
