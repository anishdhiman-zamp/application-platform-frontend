import { API_ENDPOINTS, } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import { WidgetDataRequestType, WidgetDataType, WidgetInstanceResponseType } from 'types/api/widgets.types';
import { formRequestUrlWithParams } from 'utils/common';


const Widgets = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getWidgetInstance: builder.query<WidgetInstanceResponseType, WidgetDataRequestType>({
            query: ({ widgetId }) => ({ url: formRequestUrlWithParams(API_ENDPOINTS.WIDGET_INSTANCE_GET, { widgetId }) }),
            transformResponse: ({ data }) => data,

        }),
        getWidgetData: builder.query<WidgetDataType, WidgetDataRequestType>({
            query: ({ widgetId }) => ({ url: formRequestUrlWithParams(API_ENDPOINTS.WIDGET_DATA_GET, { widgetId, }) }),
        }),
    }),
});

export const { useGetWidgetInstanceQuery, useGetWidgetDataQuery } = Widgets;
