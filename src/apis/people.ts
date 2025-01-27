import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import {
  AudiencesByOrganisationIdRequest,
  AudiencesByOrganisationIdResponse,
  InvitedAudiencesByOrganisationIdResponse,
  PostAudiencesInviteData,
} from 'types/api/people.types';
import { formRequestUrlWithParams } from 'utils/common';

const People = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAudiencesByOrganisationId: builder.query<AudiencesByOrganisationIdResponse[], AudiencesByOrganisationIdRequest>({
      query: ({ organizationId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AUDIENCES_BY_ORGANIZATION_ID_GET, { organizationId }),
      }),
      transformResponse: (data) => data,
    }),
    getInvitedAudiencesByOrganisationId: builder.query<
      InvitedAudiencesByOrganisationIdResponse[],
      AudiencesByOrganisationIdRequest
    >({
      query: ({ organizationId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.INVITED_AUDIENCES_BY_ORGANIZATION_ID_GET, { organizationId }),
      }),
      transformResponse: (data) => data,
    }),

    postInviteAudiencesByOrganisationId: builder.mutation<
      void,
      { organizationId: string; body: PostAudiencesInviteData }
    >({
      query: ({ organizationId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.INVITE_AUDIENCES_BY_ORGANIZATION_ID_POST, { organizationId }),
        method: REQUEST_TYPES.POST,
        body: body,
      }),
    }),
  }),
});

export const {
  useGetAudiencesByOrganisationIdQuery,
  useGetInvitedAudiencesByOrganisationIdQuery,
  usePostInviteAudiencesByOrganisationIdMutation,
} = People;
