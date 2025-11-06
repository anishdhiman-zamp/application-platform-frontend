import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { GenerateDeepgramAccessTokenRequest, GenerateDeepgramAccessTokenResponse } from 'types/api/deepgram.types';
import { baseApi } from '@/services/baseApi';

const Deepgram = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeepgramAccessToken: builder.query<GenerateDeepgramAccessTokenResponse, GenerateDeepgramAccessTokenRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.DEEPGRAM_AUTHENTICATE_GET,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
  }),
});

export const { useGetDeepgramAccessTokenQuery } = Deepgram;
