import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import { DatasetDataRequestType, DatasetDataResponseType, DatasetDrilldownRequestType, DatasetDrilldownResponseType, DatasetFilterConfigResponseType, DatasetListingResponseType } from 'types/api/dataset.types';
import { MapAny } from 'types/commonTypes';
import { formRequestUrlWithParams } from 'utils/common';

const Dataset = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDatasetFilterConfig: builder.query<DatasetFilterConfigResponseType[], MapAny>({
      query: (payload) => ({ url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_FILTER_CONFIG_GET, payload) }),
      transformResponse: ({ data }) => data,
    }),
    getDatasetData: builder.query<DatasetDataResponseType, DatasetDataRequestType>({
      query: ({ datasetId, queryConfig }) => (
        { url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_DATA_GET, { datasetId }), params: { queryConfig } }
      ),
      transformResponse: ({ data }) => data,
    }),
    getDatasetDrilldown: builder.query<DatasetDrilldownResponseType, DatasetDrilldownRequestType>({
      query: ({ datasetId, rowId }) => (
        { url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_DRILLDOWN_GET, { datasetId, rowId }) }
      ),
    }),
    getDatasetListing: builder.query<DatasetListingResponseType[], void>({
      query: () => ({ url: API_ENDPOINTS.DATASET_LISTING_GET }),
    }),
  }),
});

export const { useGetDatasetFilterConfigQuery, useGetDatasetDataQuery, useLazyGetDatasetDataQuery, useGetDatasetDrilldownQuery, useGetDatasetListingQuery } = Dataset;