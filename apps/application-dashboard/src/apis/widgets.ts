import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import {
  CreateWidgetPayloadType,
  CreateWidgetResponseType,
  EditWidgetInstancePayloadType,
  WidgetDataRequestType,
  WidgetDataResponseType,
  WidgetInstanceResponseType,
} from 'types/api/widgets.types';
import { formRequestUrlWithParams } from 'utils/common';
import { APITags } from '@/constants/api.constants';
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
      providesTags: [APITags.GET_WIDGET_DATA],
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
    updateWidget: builder.mutation<void, EditWidgetInstancePayloadType>({
      query: (body) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.WIDGET_INSTANCE_UPDATE_PUT, { widgetId: body.widget_instance_id }),
        method: REQUEST_TYPES.PUT,
        body,
      }),
      invalidatesTags: (_, error) => (error ? [] : [APITags.GET_PAGES, APITags.GET_WIDGET_DATA]),
    }),
    deleteWidget: builder.mutation<void, string>({
      query: (widgetId) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.WIDGET_DELETE, { widgetId }),
        method: REQUEST_TYPES.DELETE,
      }),
      invalidatesTags: (_, error) => (error ? [] : [APITags.GET_PAGES]),
    }),
    createWidget: builder.mutation<CreateWidgetResponseType, CreateWidgetPayloadType>({
      query: (body) => ({
        url: API_ENDPOINTS.WIDGET_INSTANCE_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
      transformResponse: ({ data }) => data,
      invalidatesTags: (_, error) => (error ? [] : [APITags.GET_PAGES]),
    }),
  }),
});

export const {
  useGetWidgetInstanceQuery,
  useGetWidgetDataQuery,
  useGetTransformedWidgetDataQuery,
  useUpdateWidgetMutation,
  useDeleteWidgetMutation,
  useCreateWidgetMutation,
} = Widgets;
