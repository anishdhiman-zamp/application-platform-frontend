import { API_ENDPOINTS, REQUEST_TYPES } from 'apis/apiEndpoint.constants';
import { APITags } from 'constants/api.constants';
import baseApi from 'services/api';
import {
  AcceptInvitationRequestType,
  AcceptInvitationResponseType,
  AudiencesByOrganisationIdRequest,
  AudiencesByOrganisationIdResponse,
  DeleteAudienceFromOrganizationAccessType,
  GetMembershipRequestsByOrganizationIdRequest,
  GetMembershipRequestsByOrganizationIdResponse,
  GetMyInvitationsResponseType,
  type GetTeamPendingApprovalsByResourceIdPayload,
  type GetTeamPendingApprovalsResponse,
  GetTeamsByOrganizationIdRequestType,
  GetTeamsByOrganizationIdResponseType,
  InvitedAudiencesByOrganisationIdResponse,
  PatchChangeAudienceRoleInOrganizationType,
  PostAddTeamToAudienceRequestType,
  PostAudiencesInviteData,
  PostTeamsByOrganizationIdRequestType,
  PostTeamsByOrganizationIdResponseType,
  RemoveTeamFromAudienceRequestType,
} from 'types/api/people.types';
import {
  type GetDualAdminPolicyResponse,
  GetPendingApprovalsResponse,
  GetPoliciesResponse,
  GetPolicyResultApprovalsResponse,
  type PolicyApprovalRequest,
  ProcessApprovalRequest,
  ProcessApprovalResponse,
} from 'types/api/policies.types';
import { formRequestUrlWithParams } from 'utils/common';

const People = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAudiencesByOrganisationId: builder.query<AudiencesByOrganisationIdResponse[], AudiencesByOrganisationIdRequest>({
      query: ({ organizationId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.AUDIENCES_BY_ORGANIZATION_ID_GET, { organizationId }),
      }),
      transformResponse: (data) => data,
      providesTags: [APITags.GET_PEOPLE_TEAM_MEMBERS],
    }),
    getInvitedAudiencesByOrganisationId: builder.query<
      InvitedAudiencesByOrganisationIdResponse[],
      AudiencesByOrganisationIdRequest
    >({
      query: ({ organizationId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.INVITED_AUDIENCES_BY_ORGANIZATION_ID_GET, { organizationId }),
      }),
      transformResponse: (data) => data,
      providesTags: [APITags.GET_PEOPLE_INVITATIONS],
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
      invalidatesTags: [APITags.GET_PEOPLE_INVITATIONS],
    }),
    patchChangeAudienceRoleInOrganization: builder.mutation<void, PatchChangeAudienceRoleInOrganizationType>({
      query: ({ organizationId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.CHANGE_AUDIENCE_ROLE_IN_ORGANIZATION_PATCH, { organizationId }),
        method: REQUEST_TYPES.PATCH,
        body: body,
      }),
      invalidatesTags: [APITags.GET_PEOPLE_TEAM_MEMBERS],
    }),
    deleteAudienceFromOrganizationAccess: builder.mutation<void, DeleteAudienceFromOrganizationAccessType>({
      query: ({ organizationId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.DELETE_AUDIENCE_FROM_ORGANIZATION_ACCESS, { organizationId }),
        method: REQUEST_TYPES.DELETE,
        body: body,
      }),
      invalidatesTags: [APITags.GET_PEOPLE_TEAM_MEMBERS],
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
    getTeamsByOrganizationId: builder.query<
      GetTeamsByOrganizationIdResponseType[],
      GetTeamsByOrganizationIdRequestType
    >({
      query: ({ organizationId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.TEAMS_BY_ORGANIZATION_ID_GET, { organizationId }),
      }),
      providesTags: [APITags.GET_ALL_TEAMS],
    }),
    postAddTeamToOrganization: builder.mutation<
      PostTeamsByOrganizationIdResponseType,
      PostTeamsByOrganizationIdRequestType
    >({
      query: ({ organizationId, payload }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.TEAMS_BY_ORGANIZATION_ID_POST, { organizationId }),
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
      invalidatesTags: [APITags.GET_ALL_TEAMS],
    }),
    postAddTeamToAudience: builder.mutation<void, PostAddTeamToAudienceRequestType>({
      query: ({ organizationId, teamId, payload }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ADD_TEAMS_TO_AUDIENCE_POST, { organizationId, teamId }),
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
      invalidatesTags: [APITags.GET_ALL_TEAMS],
    }),
    removeTeamFromAudience: builder.mutation<void, RemoveTeamFromAudienceRequestType>({
      query: ({ organizationId, teamId, payload }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.REMOVE_TEAMS_FROM_AUDIENCE_POST, { organizationId, teamId }),
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
      invalidatesTags: [APITags.GET_ALL_TEAMS],
    }),
    getMyInvitations: builder.query<GetMyInvitationsResponseType, void>({
      query: () => ({
        url: API_ENDPOINTS.USER_INVITATIONS_GET,
      }),
      providesTags: [APITags.GET_USER_INVITATIONS],
    }),
    acceptInvitation: builder.mutation<AcceptInvitationResponseType, AcceptInvitationRequestType>({
      query: ({ invitationId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.ACCEPT_INVITATION_POST, { invitationId }),
        method: REQUEST_TYPES.POST,
      }),
      invalidatesTags: [APITags.GET_USER_INVITATIONS],
    }),
    getPendingApprovals: builder.query<GetPendingApprovalsResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.POLICY_PENDING_APPROVALS_GET,
      }),
      providesTags: [APITags.GET_POLICY_APPROVALS],
    }),
    approvePolicy: builder.mutation<ProcessApprovalResponse, ProcessApprovalRequest>({
      query: (params) => {
        return {
          url: API_ENDPOINTS.POLICY_APPROVE_POST,
          method: REQUEST_TYPES.POST,
          params: {
            ids: params.ids.join(','),
          },
          body: {},
        };
      },
      invalidatesTags: [
        APITags.GET_PEOPLE_INVITATIONS,
        APITags.GET_PAYMENT_TEMPLATE_LIST,
        APITags.GET_PAYMENT_APPROVALS_INFO,
        APITags.GET_POLICY_APPROVALS,
      ],
    }),
    rejectPolicy: builder.mutation<ProcessApprovalResponse, ProcessApprovalRequest>({
      query: (params) => {
        return {
          url: API_ENDPOINTS.POLICY_REJECT_POST,
          method: REQUEST_TYPES.POST,
          params: {
            ids: params.ids.join(','),
          },
          body: {},
        };
      },
      invalidatesTags: [
        APITags.GET_PEOPLE_INVITATIONS,
        APITags.GET_POLICY_APPROVALS,
        APITags.GET_PAYMENT_TEMPLATE_LIST,
        APITags.GET_PAYMENT_APPROVALS_INFO,
      ],
    }),
    approvalAction: builder.mutation<ProcessApprovalResponse, PolicyApprovalRequest>({
      query: (params) => {
        return {
          url: API_ENDPOINTS.APPROVAL_ACTION_POST,
          method: REQUEST_TYPES.POST,
          body: params,
        };
      },
      invalidatesTags: [
        APITags.GET_PEOPLE_INVITATIONS,
        APITags.GET_POLICY_APPROVALS,
        APITags.GET_PAYMENT_TEMPLATE_LIST,
        APITags.GET_PAYMENT_APPROVALS_INFO,
        APITags.GET_POLICY_LIST,
        APITags.GET_TEAM_PENDING_APPROVALS,
      ],
    }),
    getAllPolicies: builder.query<GetPoliciesResponse, { resourceType?: string; actionType?: string }>({
      query: (params) => {
        return {
          url: API_ENDPOINTS.POLICY_LIST_GET,
          params: {
            resource_type: params.resourceType,
            action_type: params.actionType,
          },
        };
      },
      providesTags: [APITags.GET_POLICY_LIST],
    }),
    getPolicyResultApprovals: builder.query<GetPolicyResultApprovalsResponse, { policyResultId: string }>({
      query: ({ policyResultId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.POLICY_RESULT_APPROVALS_GET, { policyResultId }),
      }),
      providesTags: [APITags.GET_POLICY_APPROVALS],
    }),
    getDualAdminPolicy: builder.query<GetDualAdminPolicyResponse[], void>({
      query: () => ({
        url: API_ENDPOINTS.DUAL_ADMIN_POLICY_GET,
      }),
      providesTags: [APITags.GET_POLICY_LIST],
      transformResponse: ({ data }) => data,
    }),
    getTeamPendingApprovals: builder.query<GetTeamPendingApprovalsResponse[], void>({
      query: () => ({
        url: API_ENDPOINTS.TEAM_PENDING_APPROVALS_GET,
      }),
      providesTags: [APITags.GET_TEAM_PENDING_APPROVALS],
    }),
    getTeamPendingApprovalsByResourceId: builder.query<
      GetTeamPendingApprovalsResponse[],
      GetTeamPendingApprovalsByResourceIdPayload
    >({
      query: (params) => ({
        url: API_ENDPOINTS.TEAM_PENDING_APPROVALS_BY_RESOURCE_ID_GET,
        params,
      }),
      providesTags: [APITags.GET_TEAM_PENDING_APPROVALS],
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
  useGetTeamsByOrganizationIdQuery,
  usePostAddTeamToOrganizationMutation,
  usePostAddTeamToAudienceMutation,
  useRemoveTeamFromAudienceMutation,
  useGetMyInvitationsQuery,
  useAcceptInvitationMutation,
  useGetPendingApprovalsQuery,
  useApprovePolicyMutation,
  useRejectPolicyMutation,
  useGetAllPoliciesQuery,
  useGetPolicyResultApprovalsQuery,
  useGetDualAdminPolicyQuery,
  useApprovalActionMutation,
  useGetTeamPendingApprovalsQuery,
  useGetTeamPendingApprovalsByResourceIdQuery,
} = People;
