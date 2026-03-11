import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import {
  ApprovalCheckResponse,
  CheckUsernameResponse,
  EnsureProvisioningRequest,
  EnsureProvisioningResponse,
  OnboardingResponse,
  SetupOrgRequest,
  SetupOrgResponse,
  UpdateProfileRequest,
  UploadUrlRequest,
  UploadUrlResponse,
} from 'modules/onboarding/onboarding.types';
import { baseApi } from '@/services/baseApi';

const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkApproval: builder.mutation<ApprovalCheckResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.ONBOARDING_APPROVAL_POST,
        method: REQUEST_TYPES.POST,
      }),
    }),
    updateProfile: builder.mutation<OnboardingResponse, UpdateProfileRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.ONBOARDING_USER_PROFILE_PATCH,
        method: REQUEST_TYPES.PATCH,
        body,
      }),
    }),
    setupOrg: builder.mutation<SetupOrgResponse, SetupOrgRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.ONBOARDING_ORG_SETUP_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
    ensureProvisioning: builder.mutation<EnsureProvisioningResponse, EnsureProvisioningRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.ONBOARDING_PROVISIONING_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
    skipOnboarding: builder.mutation<OnboardingResponse, void>({
      query: () => ({
        url: API_ENDPOINTS.ONBOARDING_SKIP_POST,
        method: REQUEST_TYPES.POST,
      }),
    }),
    getUploadUrl: builder.mutation<UploadUrlResponse, UploadUrlRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.ONBOARDING_UPLOAD_URL_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
    checkUsername: builder.query<CheckUsernameResponse, string>({
      query: (username) => ({
        url: API_ENDPOINTS.USER_CHECK_USERNAME_GET,
        params: { username },
      }),
    }),
  }),
});

export const {
  useCheckApprovalMutation,
  useUpdateProfileMutation,
  useSetupOrgMutation,
  useEnsureProvisioningMutation,
  useSkipOnboardingMutation,
  useGetUploadUrlMutation,
  useLazyCheckUsernameQuery,
} = onboardingApi;
