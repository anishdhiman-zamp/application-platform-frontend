import baseApi from 'services/api';
import {
  DatasetDataRequestType,
  DatasetDataResponseType,
  DatasetFilterConfigResponseType,
} from 'types/api/dataset.types';

const FilterTable = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFilterConfig: builder.query<DatasetFilterConfigResponseType[], { url: string }>({
      query: ({ url }) => ({
        url,
      }),
      transformResponse: ({ data }) => data,
    }),
    getData: builder.query<DatasetDataResponseType, DatasetDataRequestType>({
      query: ({ url, query_config }) => ({
        url,
        params: { query_config },
      }),
    }),
  }),
});

export const { useGetFilterConfigQuery, useLazyGetDataQuery } = FilterTable;
