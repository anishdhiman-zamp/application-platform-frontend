import {
  DatasetDataRequestType,
  DatasetDataResponseType,
  DatasetFilterConfigResponseType,
} from 'types/api/dataset.types';
import { baseApi } from '@/services/baseApi';

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
        url: url!,
        params: { query_config: query_config! },
      }),
    }),
  }),
});

export const { useGetFilterConfigQuery, useLazyGetDataQuery } = FilterTable;
