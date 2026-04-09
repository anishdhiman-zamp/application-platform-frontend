import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import {
  GenerateSpeechToTextAccessTokenRequest,
  GenerateSpeechToTextAccessTokenResponse,
  VoiceJoinRequest,
  VoiceJoinResponse,
} from 'types/api/voiceAgent.types';
import { baseApi } from '@/services/baseApi';

const VoiceAgents = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSpeechToTextAccessToken: builder.query<
      GenerateSpeechToTextAccessTokenResponse,
      GenerateSpeechToTextAccessTokenRequest
    >({
      query: (body) => ({
        url: API_ENDPOINTS.SPEECH_TO_TEXT_ACCESS_TOKEN_GET,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),

    voiceJoin: builder.mutation<VoiceJoinResponse, VoiceJoinRequest>({
      query: (body) => ({
        url: API_ENDPOINTS.VOICE_JOIN_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
  }),
});

export const { useGetSpeechToTextAccessTokenQuery, useLazyGetSpeechToTextAccessTokenQuery, useVoiceJoinMutation } =
  VoiceAgents;
