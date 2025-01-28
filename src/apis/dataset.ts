import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import {
  AudiencesByDatasetIdRequestType,
  AudiencesByDatasetIdResponseType,
  AudiencesDatasetShareData,
  DatasetActionStatusRequestType,
  DatasetActionStatusResponseType,
  DatasetDataRequestType,
  DatasetDataResponseType,
  DatasetDrilldownRequestType,
  DatasetDrilldownResponseType,
  DatasetFilterConfigResponseType,
  DatasetListingRequestType,
  DatasetListingResponseType,
  DatasetUpdateRequestType,
  DatasetUpdateResponseType,
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
    postShareDatasetToAudiencesByDatasetId: builder.mutation<void, {datasetId: string, body: AudiencesDatasetShareData}>({
      query: ({ datasetId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.SHARE_DATASET_TO_AUDIENCES_BY_DATASET_ID_POST, { datasetId }),
        method: REQUEST_TYPES.POST,
        body: body,
      }),
    })
  }),
});

export const {
  useGetDatasetFilterConfigQuery,
  useGetDatasetDataQuery,
  useLazyGetDatasetDataQuery,
  useGetDatasetDrilldownQuery,
  useLazyGetDatasetListingQuery,
  useUpdateDatasetDataMutation,
  useLazyGetActionStatusQuery,
  useGetActionStatusQuery,
  useGetAudiencesByDatasetIdQuery,
  usePostShareDatasetToAudiencesByDatasetIdMutation,
} = Dataset;
