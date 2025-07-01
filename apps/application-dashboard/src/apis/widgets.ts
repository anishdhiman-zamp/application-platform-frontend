import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { WidgetDataRequestType, WidgetDataResponseType, WidgetInstanceResponseType } from 'types/api/widgets.types';
import { formRequestUrlWithParams } from 'utils/common';
import { baseApi } from '@/services/baseApi';

const Widgets = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWidgetInstance: builder.query<WidgetInstanceResponseType, string>({
      query: (widgetId) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.WIDGET_INSTANCE_GET, { widgetId }),
      }),
      transformResponse: ({ data }) => data,
    }),
    getWidgetData: builder.query<WidgetDataResponseType, WidgetDataRequestType>({
      query: ({ widgetId, payload }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.WIDGET_DATA_GET, { widgetId }),
        params: payload,
      }),
    }),
    getTransformedWidgetData: builder.query<any, WidgetDataRequestType>({
      queryFn: async ({ widgetId, payload }) => {
        try {
          const params = new URLSearchParams(payload);
          const response = await fetch(`/api/widgets/${widgetId}/transformed-data?${params.toString()}`, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          return { data };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: error instanceof Error ? error.message : 'Unknown error' } };
        }
      },
    }),
  }),
});

export const { useGetWidgetInstanceQuery, useGetWidgetDataQuery, useGetTransformedWidgetDataQuery } = Widgets;
