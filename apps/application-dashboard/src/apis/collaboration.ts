import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { formRequestUrlWithParams } from 'utils/common';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import {
  AudiencesByResourceIdRequest,
  AudiencesByResourceResponse,
  ChangeAudienceRoleInResourceType,
  DeleteResourceFromAudiencesType,
  PostShareResourceToAudiencesType,
} from '@/types/api/collaboration.types';
import type { PostResponseType } from '@/types/api/people.types';

export const buildUrl = (urlTemplate: string, resourceRoute: string, resourceId: string) => {
  if (resourceId === '') {
    return formRequestUrlWithParams(urlTemplate.replace('/{{resourceId}}', ''), { resourceRoute });
  }

  return formRequestUrlWithParams(urlTemplate, { resourceRoute, resourceId });
};

const Collaboration = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAudiencesByResourceId: builder.query<AudiencesByResourceResponse[], AudiencesByResourceIdRequest>({
      query: ({ resourceRoute, resourceId }) => ({
        url: buildUrl(API_ENDPOINTS.RESOURCE_AUDIENCES_BY_RESOURCE_ID_GET, resourceRoute, resourceId),
      }),
      providesTags: (_result, _error, { resourceRoute, resourceId }) => [
        { type: APITags.GET_AUDIENCE_BY_RESOURCE_ID, id: `${resourceRoute}-${resourceId}` },
      ],
    }),
    postShareResourceToAudiences: builder.mutation<PostResponseType, PostShareResourceToAudiencesType>({
      query: ({ resourceRoute, resourceId, body }) => ({
        url: buildUrl(API_ENDPOINTS.SHARE_RESOURCE_TO_AUDIENCES_POST, resourceRoute, resourceId),
        method: REQUEST_TYPES.POST,
        body: body,
      }),
      invalidatesTags: [APITags.GET_TEAM_PENDING_APPROVALS],
    }),
    patchChangeAudienceRoleInResource: builder.mutation<PostResponseType, ChangeAudienceRoleInResourceType>({
      query: ({ resourceRoute, resourceId, body }) => ({
        url: buildUrl(API_ENDPOINTS.CHANGE_AUDIENCE_ROLE_IN_RESOURCE_PATCH, resourceRoute, resourceId),
        method: REQUEST_TYPES.PATCH,
        body: body,
      }),
    }),
    deleteAudienceFromResource: builder.mutation<PostResponseType, DeleteResourceFromAudiencesType>({
      query: ({ resourceRoute, resourceId, body }) => ({
        url: buildUrl(API_ENDPOINTS.DELETE_RESOURCE_FROM_AUDIENCES, resourceRoute, resourceId),
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
  endpoints: collaborationEndpoints,
} = Collaboration;
