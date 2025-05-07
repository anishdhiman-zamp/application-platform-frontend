import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import type { DatasetFilterConfigResponseType } from '@/types/api/dataset.types';
import type {
  ActivityRunsDataResponseType,
  ProcessActivityRunsRequestType,
  StatusSummaryItem,
} from '@/types/api/processApi.types';
import { formRequestUrlWithParams } from '@/utils/common';

const Processes = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFilterConfigByProcessId: builder.query<
      { config: { is_file_import_enabled: boolean }; data: DatasetFilterConfigResponseType[] },
      { processId: string }
    >({
      query: ({ processId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ACTIVITY_RUNS_FILTER_CONFIG_GET, { processId }),
      }),
    }),
    getActivityRunsSummary: builder.query<StatusSummaryItem[], { processId: string }>({
      query: ({ processId }) => {
        return {
          url: formRequestUrlWithParams(API_ENDPOINTS.ACTIVITY_RUNS_SUMMARY_GET, { processId }),
        };
      },
    }),
    getActivityRuns: builder.query<ActivityRunsDataResponseType, ProcessActivityRunsRequestType>({
      query: ({ processId, query_config }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ACTIVITY_RUNS_GET, { processId }),
        params: { query_config },
      }),
    }),
  }),
});

export const {
  useGetFilterConfigByProcessIdQuery,
  useGetActivityRunsSummaryQuery,
  useGetActivityRunsQuery,
  useLazyGetActivityRunsQuery,
} = Processes;
