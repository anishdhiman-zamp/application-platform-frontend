import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import baseApi from 'services/api';
import {
  AudiencesByOrganisationIdRequest,
  AudiencesByOrganisationIdResponse,
  DeleteAudienceFromOrganizationAccessType,
  GetMembershipRequestsByOrganizationIdRequest,
  GetMembershipRequestsByOrganizationIdResponse,
  InvitedAudiencesByOrganisationIdResponse,
  PatchChangeAudienceRoleInOrganizationType,
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
    patchChangeAudienceRoleInOrganization: builder.mutation<void, PatchChangeAudienceRoleInOrganizationType>({
      query: ({ organizationId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.CHANGE_AUDIENCE_ROLE_IN_ORGANIZATION_PATCH, { organizationId }),
        method: REQUEST_TYPES.PATCH,
        body: body,
      }),
    }),
    deleteAudienceFromOrganizationAccess: builder.mutation<void, DeleteAudienceFromOrganizationAccessType>({
      query: ({ organizationId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DELETE_AUDIENCE_FROM_ORGANIZATION_ACCESS, { organizationId }),
        method: REQUEST_TYPES.DELETE,
        body: body,
      }),
    }),
    getMembershipRequestsByOrganizationId: builder.query<
      GetMembershipRequestsByOrganizationIdResponse,
      GetMembershipRequestsByOrganizationIdRequest
    >({
      query: ({ organizationId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.MEMBERSHIP_REQUESTS_BY_ORGANIZATION_ID_GET, { organizationId }),
      }),
    }),
    getOrganizationMembershipRequestsAll: builder.query<GetMembershipRequestsByOrganizationIdResponse, void>({
      query: () => ({ url: API_ENDPOINTS.MEMBERSHIP_REQUESTS_ALL_GET }),
    }),
  }),
});

export const {
  useGetAudiencesByOrganisationIdQuery,
  useGetInvitedAudiencesByOrganisationIdQuery,
  usePostInviteAudiencesByOrganisationIdMutation,
  usePatchChangeAudienceRoleInOrganizationMutation,
  useDeleteAudienceFromOrganizationAccessMutation,
  useGetMembershipRequestsByOrganizationIdQuery,
  useGetOrganizationMembershipRequestsAllQuery,
} = People;
