import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { UploadUrlRequest, UploadUrlResponse } from 'modules/onboarding/onboarding.types';
import {
  EnsureOrgProvisioningResponse,
  OrgProvisioningStatusResponse,
  RegisterOrgRequest,
  RegisterOrgResponse,
} from 'modules/setup-workspace/setup-workspace.types';
import { baseApi } from '@/services/baseApi';

const setupWorkspaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrgUploadUrl: builder.mutation<UploadUrlResponse, UploadUrlRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.ORGANIZATIONS_UPLOAD_URL_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
    registerOrg: builder.mutation<RegisterOrgResponse, RegisterOrgRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.ORGANIZATIONS_REGISTER_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
    provisionOrg: builder.mutation<OrgProvisioningStatusResponse, string>({
      query: (organizationId) => ({
        url: API_ENDPOINTS.ORGANIZATIONS_PROVISION_POST.replace('{{organizationId}}', organizationId),
        method: REQUEST_TYPES.POST,
      }),
      transformResponse: (response: EnsureOrgProvisioningResponse) => response.status,
    }),
  }),
});

export const { useGetOrgUploadUrlMutation, useRegisterOrgMutation, useProvisionOrgMutation } = setupWorkspaceApi;
