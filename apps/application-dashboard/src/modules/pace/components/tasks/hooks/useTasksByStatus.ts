import { useCallback, useEffect, useMemo, useState } from 'react';
import type { TaskStatus } from '@zamp-platform/chat';
import { useGetAgentTasksByStatusQuery } from '@/apis/agents';
import { useGetTasksByStatusQuery } from '@/apis/task';
import { TASKS_PAGE_SIZE } from '@/modules/pace/components/tasks/constants/tasks.constants';
import type { CreationSource, TaskListItem } from '@/modules/pace/components/tasks/types/tasks.types';

interface UseTasksByStatusOptions {
  status: TaskStatus;
  search?: string;
  agentId?: string;
  creationSource?: CreationSource;
}

export function useTasksByStatus({ status, search, agentId, creationSource }: UseTasksByStatusOptions) {
  const [page, setPage] = useState(1);
  const [allTasks, setAllTasks] = useState<TaskListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const globalTasksResult = useGetTasksByStatusQuery(
    {
      status,
      search: search || undefined,
      page,
      limit: TASKS_PAGE_SIZE,
      creation_source_type: creationSource?.type,
      creation_source_id: creationSource?.id,
    },
    { skip: !!agentId },
  );

  const agentTasksResult = useGetAgentTasksByStatusQuery(
    { agentId: agentId!, status, search: search || undefined, page, limit: TASKS_PAGE_SIZE },
    { skip: !agentId },
  );

  const { data, isFetching } = agentId ? agentTasksResult : globalTasksResult;

  const tasks = useMemo(() => data?.tasks ?? [], [data]);

  const hasMore = allTasks.length < totalCount;

  const fetchNextPage = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [isFetching, hasMore]);

  useEffect(() => {
    setPage(1);
  }, [status, search, creationSource?.type, creationSource?.id]);

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

  return {
    tasks: allTasks,
    totalCount,
    fetchNextPage,
    isFetching,
    hasMore,
  };
}
