import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import {
  AudiencesByPageIdRequest,
  AudiencesByPageIdResponse,
  DeleteAudienceFromPageAccessType,
  PageResponseType,
  PatchChangeAudienceRoleInPageType,
  PostPagesToAudiencesByPageIdType,
  SheetDetailsRequestType,
  SheetDetailsResponseType,
  SheetFilterConfigResponseType,
  SheetResponseType,
  UpdatePageIndexesPayloadType,
  UpdatePagePayloadType,
  UpdateSheetByPageIdPayloadType,
  UpdateSheetIndexesByPageIdPayloadType,
} from 'types/api/pagesApi.types';
import { formRequestUrlWithParams } from 'utils/common';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import type { ProcessesResponseType } from '@/types/api/processApi.types';

const Pages = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPages: builder.query<PageResponseType[], void>({
      query: () => ({ url: API_ENDPOINTS.PAGES_GET }),
      providesTags: [APITags.GET_PAGES],
    }),
    getPageDetails: builder.query<SheetResponseType, string>({
      query: (pageId) => ({ url: formRequestUrlWithParams(API_ENDPOINTS.PAGES_SHEETS_GET, { pageId }) }),
      providesTags: [APITags.GET_PAGE_DETAILS],
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
    getProcesses: builder.query<ProcessesResponseType[], void>({
      query: () => ({ url: API_ENDPOINTS.PROCESSES_GET }),
    }),
    postPagesToAudiencesByPageId: builder.mutation<void, PostPagesToAudiencesByPageIdType>({
      query: ({ pageId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.SHARE_PAGE_TO_AUDIENCES_BY_PAGE_ID_POST, { pageId }),
        method: REQUEST_TYPES.POST,
        body: body,
      }),
    }),
    patchChangeAudienceRoleInPage: builder.mutation<void, PatchChangeAudienceRoleInPageType>({
      query: ({ pageId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.CHANGE_AUDIENCE_ROLE_IN_PAGE_PATCH, { pageId }),
        method: REQUEST_TYPES.PATCH,
        body: body,
      }),
    }),
    deleteAudienceFromPageAccess: builder.mutation<void, DeleteAudienceFromPageAccessType>({
      query: ({ pageId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DELETE_AUDIENCE_FROM_PAGE_ACCESS, { pageId }),
        method: REQUEST_TYPES.DELETE,
        body: body,
      }),
    }),
    updatePageIndexes: builder.mutation<void, UpdatePageIndexesPayloadType>({
      query: (body) => ({
        url: API_ENDPOINTS.UPDATE_PAGE_INDEXES,
        method: REQUEST_TYPES.PATCH,
        body,
      }),
      invalidatesTags: (_, error) => (error ? [] : [APITags.GET_PAGES]),
    }),
    updateSheetIndexesByPageId: builder.mutation<void, UpdateSheetIndexesByPageIdPayloadType>({
      query: ({ pageId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.UPDATE_SHEET_INDEXES, { pageId }),
        method: REQUEST_TYPES.PATCH,
        body,
      }),
      invalidatesTags: (_, error) => (error ? [] : [APITags.GET_PAGE_DETAILS]),
    }),
    updatePage: builder.mutation<void, UpdatePagePayloadType>({
      query: ({ pageId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.UPDATE_PAGE, { pageId }),
        method: REQUEST_TYPES.PATCH,
        body,
      }),
      invalidatesTags: (_, error) => (error ? [] : [APITags.GET_PAGES]),
    }),
    updateSheetByPageId: builder.mutation<void, UpdateSheetByPageIdPayloadType>({
      query: ({ pageId, sheetId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.UPDATE_SHEET_BY_PAGE_ID, { pageId, sheetId }),
        method: REQUEST_TYPES.PATCH,
        body,
      }),
      invalidatesTags: (_, error) => (error ? [] : [APITags.GET_PAGE_DETAILS, APITags.GET_PAGES]),
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
  useGetProcessesQuery,
  usePostPagesToAudiencesByPageIdMutation,
  usePatchChangeAudienceRoleInPageMutation,
  useDeleteAudienceFromPageAccessMutation,
  useUpdatePageIndexesMutation,
  useUpdateSheetIndexesByPageIdMutation,
  useUpdatePageMutation,
  useUpdateSheetByPageIdMutation,
} = Pages;
