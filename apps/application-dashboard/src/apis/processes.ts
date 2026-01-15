import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { baseApi } from '@/services/baseApi';
import type { DatasetDataResponseType, DatasetFilterConfigResponseType } from '@/types/api/dataset.types';
import type {
  ActivityArtifactsByIdRequestType,
  ActivityArtifactsByIdResponseType,
  ActivityArtifactsRequestType,
  ActivityArtifactsResponseType,
  ActivityLogsResponseType,
  ActivityRunsDataResponseType,
  ActivitySummaryResponseType,
  DatasetArtifactsRequestType,
  EmitActivityLogsRequestType,
  EmitHITLActionRequestType,
  FilterConversationsRequestType,
  FilterConversationsResponseType,
  KnowledgeBaseRequestType,
  KnowledgeBaseResponseType,
  ProcessActivityRunsRequestType,
  ReprocessingEventsRequestType,
  ReprocessingEventsResponseType,
  SignedUrlByArtifactIdRequestType,
  SignedUrlByArtifactIdResponseType,
  StatusSummaryItem,
  UpdateArtifactRequestType,
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
    getSignedUrlByArtifactId: builder.query<SignedUrlByArtifactIdResponseType, SignedUrlByArtifactIdRequestType>({
      query: ({ processId, artifactId, fileId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ACTIVITY_SIGNED_URL_BY_FILE_ID_GET, {
          processId,
          artifactId,
          fileId,
        }),
      }),
    }),
    getDatasetArtifacts: builder.query<DatasetDataResponseType, DatasetArtifactsRequestType>({
      query: ({ processId, activityRunId, datasetId, query_config }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_ARTIFACTS_GET, { processId, activityRunId, datasetId }),
        params: { query_config },
      }),
    }),
    emitHITLAction: builder.mutation<void, EmitHITLActionRequestType>({
      query: ({ processId, activityRunId, payload }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.EMIT_HITL_ACTION_POST, { processId, activityRunId }),
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
    }),
    getKnowledgeBase: builder.query<KnowledgeBaseResponseType, KnowledgeBaseRequestType>({
      query: ({ processId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.KNOWLEDGE_BASE_GET, { processId }),
      }),
    }),
    updateArtifact: builder.mutation<void, UpdateArtifactRequestType>({
      query: ({ processId, artifactId, payload }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.UPDATE_ARTIFACT_PATCH, { processId, artifactId }),
        method: REQUEST_TYPES.PATCH,
        body: payload,
      }),
    }),
    filterConversations: builder.query<FilterConversationsResponseType, FilterConversationsRequestType>({
      query: (params) => ({
        url: API_ENDPOINTS.FILTER_CONVERSATIONS_V2_GET,
        params,
      }),
    }),
    getReprocessingEvents: builder.query<ReprocessingEventsResponseType, ReprocessingEventsRequestType>({
      query: ({ processId, activityRunId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ACTIVITY_REPROCESSING_EVENTS_GET, {
          processId,
          activityRunId,
        }),
      }),
    }),
  }),
});

export const {
  useGetFilterConfigByProcessIdQuery,
  useGetActivityRunsSummaryQuery,
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
  useLazyGetArtifactsByArtifactIdQuery,
  useGetSignedUrlByArtifactIdQuery,
  useLazyGetSignedUrlByArtifactIdQuery,
  useGetDatasetArtifactsQuery,
  useLazyGetDatasetArtifactsQuery,
  useEmitHITLActionMutation,
  useGetKnowledgeBaseQuery,
  useUpdateArtifactMutation,
  useFilterConversationsQuery,
  useLazyFilterConversationsQuery,
  useGetReprocessingEventsQuery,
  useLazyGetReprocessingEventsQuery,
} = Processes;
