import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import type { AppsListResponseType } from '@/modules/apps/apps.types';
import { baseApi } from '@/services/baseApi';

const Apps = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApps: builder.query<AppsListResponseType, void>({
      query: () => ({
        url: API_ENDPOINTS.APPS_GET,
      }),
      providesTags: [APITags.GET_APPS],
    }),
  }),
});

export const { useGetAppsQuery } = Apps;
