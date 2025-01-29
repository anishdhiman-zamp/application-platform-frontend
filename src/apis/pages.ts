import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import {
  AudiencesByPageIdRequest,
  AudiencesByPageIdResponse,
  AudiencesPageShareData,
  PageResponseType,
  SheetDetailsRequestType,
  SheetDetailsResponseType,
  SheetFilterConfigResponseType,
  SheetResponseType,
} from 'types/api/pagesApi.types';
import { formRequestUrlWithParams } from 'utils/common';

const Pages = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPages: builder.query<PageResponseType[], void>({
      query: () => ({ url: API_ENDPOINTS.PAGES_GET }),
    }),
    getPageDetails: builder.query<SheetResponseType, string>({
      query: (pageId) => ({ url: formRequestUrlWithParams(API_ENDPOINTS.PAGES_SHEETS_GET, { pageId }) }),
    }),
    getSheetDetails: builder.query<SheetDetailsResponseType, SheetDetailsRequestType>({
      query: ({ pageId, sheetId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.PAGES_SHEETS_SHEET_GET, { pageId, sheetId }),
      }),
    }),
    getSheetFilterConfig: builder.query<SheetFilterConfigResponseType, SheetDetailsRequestType>({
      query: ({ pageId, sheetId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.PAGES_SHEETS_FILTER_CONFIG_GET, { pageId, sheetId }),
      }),
    }),
    getAudiencesByPageId: builder.query<AudiencesByPageIdResponse[], AudiencesByPageIdRequest>({
      query: ({ pageId }) => ({ url: formRequestUrlWithParams(API_ENDPOINTS.AUDIENCES_BY_PAGE_ID_GET, { pageId }) }),
    }),
    postPagesToAudiencesByPageId: builder.mutation<void, { pageId: string; body: AudiencesPageShareData }>({
      query: ({ pageId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.SHARE_PAGE_TO_AUDIENCES_BY_PAGE_ID_POST, { pageId }),
        method: REQUEST_TYPES.POST,
        body: body,
      }),
    }),
  }),
});

export const {
  useGetPagesQuery,
  useGetPageDetailsQuery,
  useGetSheetDetailsQuery,
  useLazyGetSheetDetailsQuery,
  useGetSheetFilterConfigQuery,
  useGetAudiencesByPageIdQuery,
  usePostPagesToAudiencesByPageIdMutation,
} = Pages;
