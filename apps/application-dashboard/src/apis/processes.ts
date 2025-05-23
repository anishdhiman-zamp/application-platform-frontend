import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import type { DatasetFilterConfigResponseType } from '@/types/api/dataset.types';
import type {
  ActivityArtifactsByIdRequestType,
  ActivityArtifactsByIdResponseType,
  ActivityArtifactsRequestType,
  ActivityArtifactsResponseType,
  ActivityLogsResponseType,
  ActivityRunsDataResponseType,
  ActivitySummaryResponseType,
  EmitActivityLogsRequestType,
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
    getActivityRunsSummary: builder.query<StatusSummaryItem, ProcessActivityRunsRequestType>({
      query: ({ processId, query_config }) => {
        return {
          url: formRequestUrlWithParams(API_ENDPOINTS.ACTIVITY_RUNS_SUMMARY_GET, { processId }),
          params: { query_config },
        };
      },
    }),
    getActivityRuns: builder.query<ActivityRunsDataResponseType, ProcessActivityRunsRequestType>({
      query: ({ processId, query_config }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ACTIVITY_RUNS_GET, { processId }),
        params: { query_config },
      }),
    }),
    getActivityArtifacts: builder.query<ActivityArtifactsResponseType, ActivityArtifactsRequestType>({
      query: ({ processId, activityRunId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ACTIVITY_ARTIFACTS_GET, { processId, activityRunId }),
      }),
    }),
    getActivityLogs: builder.query<ActivityLogsResponseType, ActivityArtifactsRequestType>({
      query: ({ processId, activityRunId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ACTIVITY_RUN_LOGS_GET, { processId, activityRunId }),
      }),
    }),
    emitActivityLogs: builder.mutation<void, EmitActivityLogsRequestType>({
      query: ({ processId, activityRunId, payload }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.EMIT_ACTIVITY_LOGS_POST, { processId, activityRunId }),
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
    }),
    getActivitySummary: builder.query<ActivitySummaryResponseType, ActivityArtifactsRequestType>({
      query: ({ processId, activityRunId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ACTIVITY_SUMMARY_GET, { processId, activityRunId }),
      }),
    }),
    getArtifactsByArtifactId: builder.query<ActivityArtifactsByIdResponseType, ActivityArtifactsByIdRequestType>({
      query: ({ processId, activityRunId, artifact_ids }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ACTIVITY_ARTIFACTS_BY_ARTIFACT_ID_GET, {
          processId,
          activityRunId,
        }),
        params: { artifact_ids },
      }),
    }),
  }),
});

export const {
  useGetFilterConfigByProcessIdQuery,
  useGetActivityRunsSummaryQuery,
  useLazyGetActivityRunsSummaryQuery,
  useGetActivityRunsQuery,
  useLazyGetActivityRunsQuery,
  useGetActivityArtifactsQuery,
  useLazyGetActivityArtifactsQuery,
  useGetActivityLogsQuery,
  useLazyGetActivityLogsQuery,
  useEmitActivityLogsMutation,
  useGetActivitySummaryQuery,
  useLazyGetActivitySummaryQuery,
  useGetArtifactsByArtifactIdQuery,
} = Processes;
