import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import {
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
import { MapAny } from 'types/commonTypes';
import { formRequestUrlWithParams } from 'utils/common';

const Dataset = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDatasetFilterConfig: builder.query<DatasetFilterConfigResponseType[], MapAny>({
      query: (payload) => ({ url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_FILTER_CONFIG_GET, payload) }),
      transformResponse: ({ data }) => data,
    }),
    getDatasetData: builder.query<DatasetDataResponseType, DatasetDataRequestType>({
      query: ({ datasetId, queryConfig }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_DATA_GET, { datasetId }),
        params: { queryConfig },
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
} = Dataset;
