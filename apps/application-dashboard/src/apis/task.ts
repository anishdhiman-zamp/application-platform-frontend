import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import type {
  GetTaskCountsRequest,
  TaskListByStatusRequest,
  TaskListByStatusResponse,
  TaskListingCountsResponse,
} from '@/modules/pace/components/tasks/types/tasks.types';
import { baseApi } from '@/services/baseApi';

const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTaskCounts: builder.query<TaskListingCountsResponse, GetTaskCountsRequest>({
      query: (args) => ({
        url: API_ENDPOINTS.TASKS_COUNTS_GET,
        params: {
          search: (args && 'search' in args && args.search) || undefined,
          creation_source_type: (args && 'creation_source_type' in args && args.creation_source_type) || undefined,
          creation_source_id: (args && 'creation_source_id' in args && args.creation_source_id) || undefined,
        },
      }),
      providesTags: [APITags.GET_TASK_COUNTS],
    }),

    getTasksByStatus: builder.query<TaskListByStatusResponse, TaskListByStatusRequest>({
      query: ({ status, search, page = 1, limit = 20, creation_source_type, creation_source_id }) => ({
        url: API_ENDPOINTS.TASKS_LIST_GET,
        params: {
          status,
          search: search || undefined,
          page,
          limit,
          creation_source_type: creation_source_type || undefined,
          creation_source_id: creation_source_id || undefined,
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
