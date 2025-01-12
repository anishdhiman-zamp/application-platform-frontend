import { API_ENDPOINTS, } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import { DatasetDataResponseType, DatasetFilterConfigResponseType } from 'types/api/dataset.types';
import { MapAny } from 'types/commonTypes';
import { formRequestUrlWithParams } from 'utils/common';


const Dataset = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDatasetFilterConfig: builder.query<DatasetFilterConfigResponseType[], MapAny>({
            query: (payload) => ({ url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_FILTER_CONFIG_GET, payload) }),
            transformResponse: ({ data }) => data,

        }),
        getDatasetData: builder.query<DatasetDataResponseType, MapAny>({
            query: (payload) => ({ url: formRequestUrlWithParams(API_ENDPOINTS.DATASET_DATA_GET, payload) }),
            transformResponse: ({ data }) => data,
        }),
    }),
});

export const { useGetDatasetFilterConfigQuery, useGetDatasetDataQuery } = Dataset;
