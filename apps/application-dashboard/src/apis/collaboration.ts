import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import { formRequestUrlWithParams } from 'utils/common';
import {
  AudiencesByResourceIdRequest,
  AudiencesByResourceResponse,
  ChangeAudienceRoleInResourceType,
  DeleteResourceFromAudiencesType,
  PostShareResourceToAudiencesType,
} from '@/types/api/collaboration.types';

const Pages = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAudiencesByResourceId: builder.query<AudiencesByResourceResponse[], AudiencesByResourceIdRequest>({
      query: ({ resourceRoute, resourceId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.RESOURCE_AUDIENCES_BY_RESOURCE_ID_GET, {
          resourceRoute,
          resourceId,
        }),
      }),
    }),
    postShareResourceToAudiences: builder.mutation<void, PostShareResourceToAudiencesType>({
      query: ({ resourceRoute, resourceId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.SHARE_RESOURCE_TO_AUDIENCES_POST, { resourceRoute, resourceId }),
        method: REQUEST_TYPES.POST,
        body: body,
      }),
    }),
    patchChangeAudienceRoleInResource: builder.mutation<void, ChangeAudienceRoleInResourceType>({
      query: ({ resourceRoute, resourceId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.CHANGE_AUDIENCE_ROLE_IN_RESOURCE_PATCH, {
          resourceRoute,
          resourceId,
        }),
        method: REQUEST_TYPES.PATCH,
        body: body,
      }),
    }),
    deleteAudienceFromResource: builder.mutation<void, DeleteResourceFromAudiencesType>({
      query: ({ resourceRoute, resourceId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DELETE_RESOURCE_FROM_AUDIENCES, { resourceRoute, resourceId }),
        method: REQUEST_TYPES.DELETE,
        body: body,
      }),
    }),
  }),
});

export const {
  useGetAudiencesByResourceIdQuery,
  usePostShareResourceToAudiencesMutation,
  usePatchChangeAudienceRoleInResourceMutation,
  useDeleteAudienceFromResourceMutation,
} = Pages;
