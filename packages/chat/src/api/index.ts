import baseApiProvider from '@zamp-platform/api/baseQuery';
import { REQUEST_TYPES } from '@zamp-platform/api/constants';
import { formRequestUrlWithParams } from '@zamp-platform/utils';

import {
  CreateConversationPayloadType,
  CreateConversationResponseType,
  PostMessagePayloadType,
  PostMessageResponseType,
} from '../types/chat.types';

export enum APITags {
  CREATE_CONVERSATION = 'CREATE_CONVERSATION',
  POST_MESSAGE = 'POST_MESSAGE',
}
export const API_TAGS = Object.values(APITags);

export const chatApi = baseApiProvider(APITags, 'chatApi');

export const API_ENDPOINTS = {
  POST_MESSAGE: '/conversations/{{conversationId}}/messages',
  CREATE_CONVERSATION: '/conversations/',
};

const ConversationService = chatApi.injectEndpoints({
  endpoints: (builder) => ({
    sendMessage: builder.mutation<PostMessageResponseType, PostMessagePayloadType>({
      query: ({ conversationId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.POST_MESSAGE, { conversationId }),
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
    createConversation: builder.mutation<CreateConversationResponseType, CreateConversationPayloadType>({
      query: (body) => ({
        url: API_ENDPOINTS.CREATE_CONVERSATION,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
  }),
});

export const { useSendMessageMutation, useCreateConversationMutation } = ConversationService;
