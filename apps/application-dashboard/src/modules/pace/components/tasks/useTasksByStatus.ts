import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TaskStatus } from '@zamp-platform/chat';
import { TASKS_PAGE_SIZE } from 'modules/pace/components/tasks/task-listing.constants';
import type { TaskListItem } from 'modules/pace/components/tasks/task-listing.types';
import { useGetTasksByStatusQuery } from '@/apis/task';

interface UseTasksByStatusOptions {
  status: TaskStatus;
  search?: string;
}

export function useTasksByStatus({ status, search }: UseTasksByStatusOptions) {
  const [page, setPage] = useState(1);
  const [allTasks, setAllTasks] = useState<TaskListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const { data, isFetching } = useGetTasksByStatusQuery({
    status,
    search: search || undefined,
    page,
    limit: TASKS_PAGE_SIZE,
  });

  const tasks = useMemo(() => data?.tasks ?? [], [data]);

  useEffect(() => {
    setPage(1);
    setAllTasks([]);
    setTotalCount(0);
  }, [status, search]);

  useEffect(() => {
    if (data?.count !== undefined) {
      setTotalCount(data.count);
    }
  }, [data?.count]);

  useEffect(() => {
    if (page === 1) {
      setAllTasks(tasks);
    } else if (tasks.length > 0) {
      setAllTasks((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newTasks = tasks.filter((t) => !existingIds.has(t.id));

        return [...prev, ...newTasks];
      });
    }
  }, [tasks, page]);

  const hasMore = allTasks.length < totalCount;

  const fetchNextPage = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [isFetching, hasMore]);

  return {
    tasks: allTasks,
    totalCount,
    fetchNextPage,
    isFetching,
    hasMore,
  };
}
