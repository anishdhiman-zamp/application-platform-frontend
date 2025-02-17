import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
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
  DatasetFilterConfigResponseType,
  DatasetListingRequestType,
  DatasetListingResponseType,
  DatasetUpdateRequestType,
  DatasetUpdateResponseType,
  DeleteAudienceFromDatasetAccessType,
  GetRulesByDatasetColumnsRequestType,
  GetRulesByDatasetColumnsResponseType,
  GetRulesByRuleIdsRequestType,
  PatchChangeAudienceRoleInDatasetType,
  PostShareDatasetToAudiencesByDatasetIdType,
  RuleType,
} from 'types/api/dataset.types';
import { formRequestUrlWithParams } from 'utils/common';

const Dataset = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDatasetFilterConfig: builder.query<DatasetFilterConfigResponseType[], { datasetId: string }>({
      query: ({ datasetId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_FILTER_CONFIG_GET, { datasetId }),
      }),
      transformResponse: ({ data }) => data,
    }),
    getDatasetData: builder.query<DatasetDataResponseType, DatasetDataRequestType>({
      query: ({ datasetId, query_config }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_DATA_GET, { datasetId }),
        params: { query_config },
      }),
      transformResponse: ({ data }) => data,
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
      query: () => ({ url: API_ENDPOINTS.DATASET_LISTING_GET }),
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
    getRulesByRuleIds: builder.query<RuleType[], GetRulesByRuleIdsRequestType>({
      query: (params) => ({
        url: API_ENDPOINTS.DATASET_RULES_BY_RULE_IDS_GET,
        params,
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
  useLazyGetDatasetListingQuery,
  useUpdateDatasetDataMutation,
  useLazyGetActionStatusQuery,
  useGetActionStatusQuery,
  useGetAudiencesByDatasetIdQuery,
  usePostShareDatasetToAudiencesByDatasetIdMutation,
  usePatchChangeAudienceRoleInDatasetMutation,
  useDeleteAudienceFromDatasetAccessMutation,
  useGetRulesByDatasetColumnsQuery,
  useGetRulesByRuleIdsQuery,
  useLazyGetRulesByRuleIdsQuery,
} = Dataset;
