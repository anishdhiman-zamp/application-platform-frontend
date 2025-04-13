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
      query: ({ resourceType, resourceId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AUDIENCES_BY_RESOURCE_ID_GET, { resourceType, resourceId }),
      }),
    }),
    postShareResourceToAudiences: builder.mutation<void, PostShareResourceToAudiencesType>({
      query: ({ resourceType, resourceId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.SHARE_RESOURCE_TO_AUDIENCES_POST, { resourceType, resourceId }),
        method: REQUEST_TYPES.POST,
        body: body,
      }),
    }),
    patchChangeAudienceRoleInResource: builder.mutation<void, ChangeAudienceRoleInResourceType>({
      query: ({ resourceType, resourceId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.CHANGE_AUDIENCE_ROLE_IN_RESOURCE_PATCH, {
          resourceType,
          resourceId,
        }),
        method: REQUEST_TYPES.PATCH,
        body: body,
      }),
    }),
    deleteResourceFromAudiences: builder.mutation<void, DeleteResourceFromAudiencesType>({
      query: ({ resourceType, resourceId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DELETE_RESOURCE_FROM_AUDIENCES, { resourceType, resourceId }),
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
  useDeleteResourceFromAudiencesMutation,
} = Pages;
