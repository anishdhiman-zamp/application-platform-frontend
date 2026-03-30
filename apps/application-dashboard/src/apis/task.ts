import type { TaskStatus } from '@zamp-platform/chat';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import type {
  TaskListByStatusResponse,
  TaskListingCountsResponse,
} from '@/modules/pace/components/tasks/task-listing.types';
import { baseApi } from '@/services/baseApi';

interface GetTasksByStatusParams {
  status: TaskStatus;
  search?: string;
  page?: number;
  limit?: number;
}

const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTaskCounts: builder.query<TaskListingCountsResponse, { search?: string } | void>({
      query: (args) => ({
        url: API_ENDPOINTS.TASKS_COUNTS_GET,
        params: {
          search: (args && 'search' in args && args.search) || undefined,
        },
      }),
      providesTags: [APITags.GET_TASK_COUNTS],
    }),

    getTasksByStatus: builder.query<TaskListByStatusResponse, GetTasksByStatusParams>({
      query: ({ status, search, page = 1, limit = 20 }) => ({
        url: API_ENDPOINTS.TASKS_LIST_GET,
        params: {
          status,
          search: search || undefined,
          page,
          limit,
        },
      }),
      providesTags: [APITags.GET_TASK_LIST],
    }),
  }),
});

export const {
  useGetTaskCountsQuery,
  useLazyGetTaskCountsQuery,
  useGetTasksByStatusQuery,
  useLazyGetTasksByStatusQuery,
} = taskApi;
