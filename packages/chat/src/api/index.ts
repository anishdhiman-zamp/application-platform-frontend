import baseApiProvider from '@zamp-platform/api/baseQuery';
import { REQUEST_TYPES } from '@zamp-platform/api/constants';
import { formRequestUrlWithParams } from '@zamp-platform/utils';

import {
  CreateConversationPayloadType,
  CreateConversationPayloadTypeV2,
  CreateConversationResponseType,
  GetConversationByIdRequestType,
  GetConversationByIdResponseType,
  GetFileDownloadUrlRequestType,
  GetFileDownloadUrlResponseType,
  GetFilesByIdsRequestType,
  GetFilesByIdsResponseType,
  PostMessagePayloadType,
  PostMessageResponseType,
} from '../types/chat.types';

export enum APITags {
  CREATE_CONVERSATION = 'CREATE_CONVERSATION',
  POST_MESSAGE = 'POST_MESSAGE',
  GET_CONVERSATION_BY_ID = 'GET_CONVERSATION_BY_ID',
}
export const API_TAGS = Object.values(APITags);

export const chatApi = baseApiProvider(APITags, 'chatApi');

export const API_ENDPOINTS = {
  POST_MESSAGE: '/conversations/{{conversationId}}/messages',
  CREATE_CONVERSATION: '/conversations/',
  POST_MESSAGE_V2: 'v2/conversations/{{conversationId}}/messages',
  GET_CONVERSATION_BY_ID: 'v2/conversations/{{conversationId}}',
  CREATE_CONVERSATION_V2: 'v2/conversations',
  GET_FILES_BY_IDS: '/file-imports',
  GET_FILE_DOWNLOAD_URL: '/file-imports/{{file_upload_id}}/download-url',
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
    getConversationById: builder.query<GetConversationByIdResponseType, GetConversationByIdRequestType>({
      query: ({ conversationId, resourceId, resourceType }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.GET_CONVERSATION_BY_ID, { conversationId }),
        params: {
          resource_id: resourceId,
          resource_type: resourceType,
        },
      }),
      providesTags: (_result, _error, arg) => [{ type: APITags.GET_CONVERSATION_BY_ID, id: arg.conversationId }],
    }),
    createConversationV2: builder.mutation<CreateConversationResponseType, CreateConversationPayloadTypeV2>({
      query: (body) => ({
        url: API_ENDPOINTS.CREATE_CONVERSATION_V2,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
    sendMessageV2: builder.mutation<PostMessageResponseType, PostMessagePayloadType>({
      query: ({ conversationId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.POST_MESSAGE_V2, { conversationId }),
        method: REQUEST_TYPES.POST,
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [{ type: APITags.GET_CONVERSATION_BY_ID, id: arg.conversationId }],
    }),
    getFilesByIds: builder.query<GetFilesByIdsResponseType, GetFilesByIdsRequestType>({
      query: (params) => ({
        url: API_ENDPOINTS.GET_FILES_BY_IDS,
        params,
      }),
    }),
    getFileDownloadUrl: builder.query<GetFileDownloadUrlResponseType, GetFileDownloadUrlRequestType>({
      query: ({ file_upload_id }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.GET_FILE_DOWNLOAD_URL, { file_upload_id }),
      }),
    }),
  }),
});

export const {
  useSendMessageMutation,
  useCreateConversationMutation,
  useGetConversationByIdQuery,
  useCreateConversationV2Mutation,
  useSendMessageV2Mutation,
  useGetFilesByIdsQuery,
  useLazyGetFileDownloadUrlQuery,
  useLazyGetConversationByIdQuery,
} = ConversationService;
