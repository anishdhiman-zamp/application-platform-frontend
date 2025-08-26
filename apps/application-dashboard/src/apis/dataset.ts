import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import {
  AudiencesByDatasetIdRequestType,
  AudiencesByDatasetIdResponseType,
  DatasetActionStatusRequestType,
  DatasetActionStatusResponseType,
  DatasetDataRequestType,
  DatasetDataResponseType,
  DatasetDrilldownRequestType,
  DatasetDrilldownResponseType,
  DatasetExportResponseType,
  DatasetExportsSignedUrlRequestType,
  DatasetExportsSignedUrlResponseType,
  DatasetListingRequestType,
  DatasetListingResponseType,
  DatasetUpdateRequestType,
  DatasetUpdateResponseType,
  DeleteAudienceFromDatasetAccessType,
  type DownloadFileResponseType,
  GetAiTransformationRequestType,
  GetAiTransformationResponseType,
  GetDatasetFilterConfigResponseType,
  GetFileImportHistoryResponseType,
  GetRulesByDatasetColumnsRequestType,
  GetRulesByDatasetColumnsResponseType,
  GetRulesByRuleIdsRequestType,
  PatchChangeAudienceRoleInDatasetType,
  PostAiTransformationConfirmRequestType,
  PostAiTransformationConfirmResponseType,
  PostShareDatasetToAudiencesByDatasetIdType,
  PreviewTransformationRequest,
  PreviewTransformationResponse,
  RuleType,
  UpdateRulePriorityRequestType,
} from 'types/api/dataset.types';
import { formRequestUrlWithParams } from 'utils/common';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';

const Dataset = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDatasetFilterConfig: builder.query<GetDatasetFilterConfigResponseType, { datasetId: string }>({
      query: ({ datasetId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_FILTER_CONFIG_GET, { datasetId }),
      }),
      providesTags: [APITags.GET_DATASET_FILTER_CONFIG],
    }),
    getDatasetData: builder.query<DatasetDataResponseType, DatasetDataRequestType>({
      query: ({ datasetId, query_config }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_DATA_GET, { datasetId }),
        params: { query_config },
        timeout: 120000,
      }),
    }),
    getDatasetExport: builder.query<DatasetExportResponseType, DatasetDataRequestType>({
      query: ({ datasetId, query_config }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_EXPORT_GET, { datasetId }),
        params: { query_config },
      }),
    }),
    getDatasetExportsSignedUrl: builder.query<DatasetExportsSignedUrlResponseType, DatasetExportsSignedUrlRequestType>({
      query: ({ datasetId, workflowId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_EXPORTS_SIGNED_URL_GET, { datasetId, workflowId }),
      }),
    }),
    getDatasetDrilldown: builder.query<DatasetDrilldownResponseType, DatasetDrilldownRequestType>({
      query: ({ datasetId, rowId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_DRILLDOWN_GET, { datasetId, rowId }),
      }),
    }),
    getDatasetListing: builder.query<DatasetListingResponseType, DatasetListingRequestType>({
      query: (params) => ({ url: API_ENDPOINTS.DATASET_LISTING_GET, params }),
      keepUnusedDataFor: 6000,
      providesTags: [APITags.GET_DATASET_LISTING],
    }),
    updateDatasetData: builder.mutation<DatasetUpdateResponseType, DatasetUpdateRequestType>({
      query: ({ datasetId, data }) => ({
        method: REQUEST_TYPES.POST,
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_UPDATE_POST, { datasetId }),
        body: data,
      }),
    }),
    getActionStatus: builder.query<DatasetActionStatusResponseType[], DatasetActionStatusRequestType>({
      query: ({ datasetId, params }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_ACTION_STATUS_GET, { datasetId }),
        params,
      }),
    }),
    getAudiencesByDatasetId: builder.query<AudiencesByDatasetIdResponseType[], AudiencesByDatasetIdRequestType>({
      query: ({ datasetId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AUDIENCES_BY_DATASET_ID_GET, { datasetId }),
      }),
    }),
    postShareDatasetToAudiencesByDatasetId: builder.mutation<void, PostShareDatasetToAudiencesByDatasetIdType>({
      query: ({ datasetId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.SHARE_DATASET_TO_AUDIENCES_BY_DATASET_ID_POST, { datasetId }),
        method: REQUEST_TYPES.POST,
        body: body,
      }),
    }),
    patchChangeAudienceRoleInDataset: builder.mutation<void, PatchChangeAudienceRoleInDatasetType>({
      query: ({ datasetId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.CHANGE_AUDIENCE_ROLE_IN_DATASET_PATCH, { datasetId }),
        method: REQUEST_TYPES.PATCH,
        body: body,
      }),
    }),
    deleteAudienceFromDatasetAccess: builder.mutation<void, DeleteAudienceFromDatasetAccessType>({
      query: ({ datasetId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DELETE_AUDIENCE_FROM_DATASET_ACCESS, { datasetId }),
        method: REQUEST_TYPES.DELETE,
        body: body,
      }),
    }),
    getRulesByDatasetColumns: builder.query<GetRulesByDatasetColumnsResponseType, GetRulesByDatasetColumnsRequestType>({
      query: (params) => ({
        url: API_ENDPOINTS.DATASET_RULES_LISTING_GET,
        params,
      }),
    }),
    getPreviewTransformation: builder.mutation<PreviewTransformationResponse, PreviewTransformationRequest>({
      query: ({ file_upload_id, dataset_id }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_FILE_IMPORTS_ACTION_ID, { file_upload_id }),
        method: REQUEST_TYPES.POST,
        body: { dataset_id },
      }),
    }),
    getAiTransformation: builder.query<GetAiTransformationResponseType, GetAiTransformationRequestType>({
      query: ({ file_upload_id }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_FILE_IMPORTS_PREVIEW_TRANSFORMATION_GET, {
          file_upload_id,
        }),
      }),
    }),
    postAiTransformationConfirm: builder.mutation<
      PostAiTransformationConfirmResponseType,
      PostAiTransformationConfirmRequestType
    >({
      query: ({ file_upload_id, dataset_id }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_FILE_IMPORTS_PREVIEW_TRANSFORMATION_CONFIRM_POST, {
          file_upload_id,
        }),
        method: REQUEST_TYPES.POST,
        body: { dataset_id },
      }),
    }),

    getRulesByRuleIds: builder.query<RuleType[], GetRulesByRuleIdsRequestType>({
      query: (params) => ({
        url: API_ENDPOINTS.DATASET_RULES_BY_RULE_IDS_GET,
        params,
      }),
    }),
    updateRulePriority: builder.mutation<DatasetUpdateResponseType, UpdateRulePriorityRequestType>({
      query: (body) => ({
        url: API_ENDPOINTS.DATASET_RULES_PRIORITY_PATCH,
        method: REQUEST_TYPES.PATCH,
        body,
      }),
    }),
    getFileImportHistory: builder.query<GetFileImportHistoryResponseType, { datasetId: string }>({
      query: ({ datasetId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_FILE_IMPORT_HISTORY_GET, { datasetId }),
      }),
    }),
    deleteRule: builder.mutation<DatasetUpdateResponseType, { ruleId: string }>({
      query: ({ ruleId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_RULE_DELETE, { ruleId }),
        method: REQUEST_TYPES.DELETE,
      }),
    }),
    downloadFile: builder.query<DownloadFileResponseType, { fileImportId: string }>({
      query: ({ fileImportId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DOWNLOAD_FILE_GET, { fileImportId }),
      }),
    }),
    postFormsSignedUploadAck: builder.mutation<void, { fileImportId: string }>({
      query: ({ fileImportId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.FORMS_SIGNED_UPLOAD_ACK_POST, { fileImportId }),
        method: REQUEST_TYPES.POST,
      }),
    }),
  }),
});

export const {
  useGetDatasetFilterConfigQuery,
  useGetDatasetDataQuery,
  useLazyGetDatasetDataQuery,
  useLazyGetDatasetExportQuery,
  useLazyGetDatasetExportsSignedUrlQuery,
  useGetDatasetDrilldownQuery,
  useGetDatasetListingQuery,
  useUpdateDatasetDataMutation,
  useLazyGetActionStatusQuery,
  useGetActionStatusQuery,
  useGetAudiencesByDatasetIdQuery,
  usePostShareDatasetToAudiencesByDatasetIdMutation,
  usePatchChangeAudienceRoleInDatasetMutation,
  useDeleteAudienceFromDatasetAccessMutation,
  useGetRulesByDatasetColumnsQuery,
  useGetPreviewTransformationMutation,
  useGetRulesByRuleIdsQuery,
  useLazyGetRulesByRuleIdsQuery,
  useUpdateRulePriorityMutation,
  useGetAiTransformationQuery,
  useLazyGetAiTransformationQuery,
  usePostAiTransformationConfirmMutation,
  useGetFileImportHistoryQuery,
  useDeleteRuleMutation,
  useLazyDownloadFileQuery,
  usePostFormsSignedUploadAckMutation,
} = Dataset;
