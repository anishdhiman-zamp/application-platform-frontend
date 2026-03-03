import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import {
  CheckUsernameResponse,
  OnboardingResponse,
  OrganizationModel,
  SetupOrgRequest,
  UpdateProfileRequest,
  UploadUrlRequest,
  UploadUrlResponse,
  UserModel,
  WelcomeRequest,
} from 'modules/onboarding/onboarding.types';
import { baseApi } from '@/services/baseApi';

const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateProfile: builder.mutation<OnboardingResponse<UserModel>, UpdateProfileRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.ONBOARDING_UPDATE_PROFILE_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
    setupOrg: builder.mutation<OnboardingResponse<OrganizationModel>, SetupOrgRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.ONBOARDING_SETUP_ORG_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
    welcome: builder.mutation<OnboardingResponse<null>, WelcomeRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.ONBOARDING_WELCOME_POST,
        method: REQUEST_TYPES.POST,
        body,
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
  useUpdateProfileMutation,
  useSetupOrgMutation,
  useWelcomeMutation,
  useGetUploadUrlMutation,
  useLazyCheckUsernameQuery,
} = onboardingApi;
