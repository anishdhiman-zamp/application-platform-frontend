import { useCallback, useMemo, useState } from 'react';
import { TASK_STATUS, type TaskStatus } from '@zamp-platform/chat';
import type {
  TaskCreator,
  TaskListingCountsResponse,
  TaskListItem,
} from 'modules/pace/components/tasks/task-listing.types';

const MOCK_CREATORS: TaskCreator[] = [
  { id: 'u1', name: 'Sarah Chen', avatar_url: undefined },
  { id: 'u2', name: 'Alex Rivera', avatar_url: undefined },
  { id: 'u3', name: 'Jordan Lee', avatar_url: undefined },
  { id: 'u4', name: 'Morgan Patel', avatar_url: undefined },
];

const MOCK_TITLES: Record<TaskStatus, string[]> = {
  [TASK_STATUS.NEEDS_INPUT]: [
    'Researching unconventional signals: power ships demand',
    'Searching X for NVDA retail sentiment',
    'Analyze market trends for Q2 forecast',
    'Review competitor pricing strategy',
    'Compile user feedback from latest release',
  ],
  [TASK_STATUS.IN_PROGRESS]: [
    'Sum of 190 coordinated on a parabola',
    'Processing satellite imagery for region analysis',
    'Running Monte Carlo simulation batch',
    'Aggregating cross-platform engagement metrics',
    'Building predictive model for churn analysis',
  ],
  [TASK_STATUS.FAILED]: [
    'Failed to fetch API data from external source',
    'Timeout on large dataset processing',
    'Connection refused during webhook delivery',
  ],
  [TASK_STATUS.COMPLETED]: [
    'Generated quarterly revenue report',
    'Exported user segmentation data',
    'Synced CRM contacts with marketing platform',
    'Completed A/B test analysis for landing page',
    'Processed batch invoice reconciliation',
  ],
};

function generateMockTasks(status: TaskStatus, count: number): TaskListItem[] {
  const titles = MOCK_TITLES[status];

  return Array.from({ length: count }, (_, i) => {
    const title = titles[i % titles.length];
    const totalSubtasks = Math.floor(Math.random() * 6) + 1;
    const completedSubtasks =
      status === TASK_STATUS.COMPLETED ? totalSubtasks : Math.floor(Math.random() * totalSubtasks);
    const creator = MOCK_CREATORS[i % MOCK_CREATORS.length];

    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();

    date.setDate(date.getDate() - daysAgo);

    return {
      id: `task-${status}-${i}`,
      title,
      description: `${title} - detailed analysis and processing of the gathered data points across multiple dimensions`,
      status,
      total_subtasks: totalSubtasks,
      completed_subtasks: completedSubtasks,
      subtasks: Array.from({ length: totalSubtasks }, (_, j) => {
        const hasChildren = j % 3 === 1 && totalSubtasks > 2;
        const childCount = hasChildren ? 2 : 0;
        const childCompleted = hasChildren ? 1 : 0;

        return {
          id: `subtask-${status}-${i}-${j}`,
          title: `Step ${j + 1}: ${j < completedSubtasks ? 'Completed' : 'Pending'} subtask`,
          status: j < completedSubtasks ? TASK_STATUS.COMPLETED : TASK_STATUS.IN_PROGRESS,
          total_subtasks: childCount,
          completed_subtasks: childCompleted,
          subtasks: hasChildren
            ? Array.from({ length: childCount }, (_, k) => ({
                id: `subtask-${status}-${i}-${j}-${k}`,
                title: `Sub-step ${k + 1}: ${k < childCompleted ? 'Done' : 'In progress'}`,
                status: k < childCompleted ? TASK_STATUS.COMPLETED : TASK_STATUS.IN_PROGRESS,
              }))
            : undefined,
        };
      }),
      created_by: creator,
      created_at: date.toISOString(),
    };
  });
}

const MOCK_STATUS_COUNTS: Record<TaskStatus, number> = {
  [TASK_STATUS.NEEDS_INPUT]: 100,
  [TASK_STATUS.IN_PROGRESS]: 400,
  [TASK_STATUS.FAILED]: 25,
  [TASK_STATUS.COMPLETED]: 350,
};

const ALL_MOCK_TASKS: Record<TaskStatus, TaskListItem[]> = {
  [TASK_STATUS.NEEDS_INPUT]: generateMockTasks(TASK_STATUS.NEEDS_INPUT, MOCK_STATUS_COUNTS[TASK_STATUS.NEEDS_INPUT]),
  [TASK_STATUS.IN_PROGRESS]: generateMockTasks(TASK_STATUS.IN_PROGRESS, MOCK_STATUS_COUNTS[TASK_STATUS.IN_PROGRESS]),
  [TASK_STATUS.FAILED]: generateMockTasks(TASK_STATUS.FAILED, MOCK_STATUS_COUNTS[TASK_STATUS.FAILED]),
  [TASK_STATUS.COMPLETED]: generateMockTasks(TASK_STATUS.COMPLETED, MOCK_STATUS_COUNTS[TASK_STATUS.COMPLETED]),
};

export function useMockTaskCounts(search?: string): {
  data: TaskListingCountsResponse | undefined;
  isLoading: boolean;
} {
  const data = useMemo(() => {
    const filterBySearch = (tasks: TaskListItem[]) => {
      if (!search) return tasks;
      const query = search.toLowerCase();

      return tasks.filter((t) => t.title.toLowerCase().includes(query));
    };

    const counts = Object.entries(ALL_MOCK_TASKS).map(([status, tasks]) => ({
      status: status as TaskStatus,
      count: filterBySearch(tasks).length,
    }));

    const total = counts.reduce((sum, c) => sum + c.count, 0);

    return { counts, total };
  }, [search]);

  return { data, isLoading: false };
}

export function useMockTasksByStatus(
  status: TaskStatus,
  search?: string,
): {
  tasks: TaskListItem[];
  totalCount: number;
  fetchNextPage: () => void;
  isFetching: boolean;
  hasMore: boolean;
} {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const allFiltered = useMemo(() => {
    const all = ALL_MOCK_TASKS[status] ?? [];

    if (!search) return all;
    const query = search.toLowerCase();

    return all.filter((t) => t.title.toLowerCase().includes(query));
  }, [status, search]);

  const tasks = useMemo(() => allFiltered.slice(0, page * pageSize), [allFiltered, page]);

  const fetchNextPage = useCallback(() => {
    if (tasks.length < allFiltered.length) {
      setPage((p) => p + 1);
    }
  }, [tasks.length, allFiltered.length]);

  return {
    tasks,
    totalCount: allFiltered.length,
    fetchNextPage,
    isFetching: false,
    hasMore: tasks.length < allFiltered.length,
  };
}
