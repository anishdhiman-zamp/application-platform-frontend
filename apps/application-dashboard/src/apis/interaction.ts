import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { baseApi } from '@/services/baseApi';
import { PostInteractionPayloadType, PostInteractionResponseType } from '@/types/api/interaction.types';
import { formRequestUrlWithParams } from '@/utils/common';

const Interactions = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    postInteraction: builder.mutation<PostInteractionResponseType, PostInteractionPayloadType>({
      query: ({ conversationId, messageId, params, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.INTERACTION_POST, { conversationId, messageId }),
        method: REQUEST_TYPES.POST,
        params,
        body,
      }),
    }),
  }),
});

export const { usePostInteractionMutation } = Interactions;
