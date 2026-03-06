import baseApiProvider from '@zamp-platform/api/baseQuery';
import { REQUEST_TYPES } from '@zamp-platform/api/constants';
import { formRequestUrlWithParams } from '@zamp-platform/utils';

import {
  CreateConversationPayloadType,
  CreateConversationPayloadTypeV2,
  CreateConversationResponseType,
  GenerateSpeechToTextAccessTokenRequest,
  GenerateSpeechToTextAccessTokenResponse,
  GetConversationByIdRequestType,
  GetConversationByIdResponseType,
  GetFileDownloadUrlRequestType,
  GetFileDownloadUrlResponseType,
  GetFilesByIdsRequestType,
  GetFilesByIdsResponseType,
  GetOutputFileDownloadRequestType,
  PostInteractionDisablePayloadType,
  PostInteractionPayloadType,
  PostInteractionResponseType,
  PostMessagePayloadType,
  PostMessageResponseType,
  SignedUrlBodyType,
  SignedUrlResponseType,
  StopConversationPayloadType,
  StopConversationResponseType,
  SubmitChatFeedbackRequestType,
  SubmitChatFeedbackResponseType,
} from '../types/chat.types';

export enum APITags {
  CREATE_CONVERSATION = 'CREATE_CONVERSATION',
  POST_MESSAGE = 'POST_MESSAGE',
  GET_CONVERSATION_BY_ID = 'GET_CONVERSATION_BY_ID',
  INTERACTION = 'INTERACTION',
  FILE_UPLOAD = 'FILE_UPLOAD',
  SPEECH_TO_TEXT = 'SPEECH_TO_TEXT',
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
  FORMS_SIGNED_UPLOAD_URL_POST: 'file-imports/initiate',
  FORMS_SIGNED_UPLOAD_ACK_POST: 'file-imports/{{fileImportId}}/acknowledge',
  INTERACTION_POST: '/v2/conversations/{{conversationId}}/messages/{{messageId}}/interactions',
  INTERACTION_DISABLE_POST: '/v2/conversations/{{conversationId}}/messages/{{messageId}}/interactions/disable',
  SPEECH_TO_TEXT_ACCESS_TOKEN_GET: '/speech-to-text/generate-access-token',
  GET_OUTPUT_FILE_DOWNLOAD: 'v3/conversations/{{conversationId}}/output-files/{{filename}}/download',
  SUBMIT_CHAT_FEEDBACK: 'v3/conversations/{{conversationId}}/messages/{{messageId}}/chat-feedback',
  TASKS_MESSAGES_GET: 'tasks/{{conversationId}}/messages',
  STOP_CONVERSATION: 'v3/conversations/{{conversationId}}/stop',
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
      query: ({ conversationId, resourceId, resourceType, url }) => ({
        url: formRequestUrlWithParams(url || API_ENDPOINTS.GET_CONVERSATION_BY_ID, { conversationId }),
        params: {
          resource_id: resourceId,
          resource_type: resourceType,
        },
      }),
      providesTags: (_result, _error, arg) => [{ type: APITags.GET_CONVERSATION_BY_ID, id: arg.conversationId }],
    }),
    createConversationV2: builder.mutation<
      CreateConversationResponseType,
      CreateConversationPayloadTypeV2 & { url?: string }
    >({
      query: ({ url, ...body }) => ({
        url: url || API_ENDPOINTS.CREATE_CONVERSATION_V2,
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
    sendMessageV2: builder.mutation<PostMessageResponseType, PostMessagePayloadType & { url?: string }>({
      query: ({ conversationId, body, url }) => ({
        url: formRequestUrlWithParams(url || API_ENDPOINTS.POST_MESSAGE_V2, { conversationId }),
        method: REQUEST_TYPES.POST,
        body,
      }),
      // invalidatesTags: (_result, _error, arg) => [{ type: APITags.GET_CONVERSATION_BY_ID, id: arg.conversationId }],
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
    getSignedUrl: builder.mutation<SignedUrlResponseType, SignedUrlBodyType>({
      query: ({ path, payload }) => ({
        url: path,
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
    }),
    postFormsSignedUploadAck: builder.mutation<void, { fileImportId: string }>({
      query: ({ fileImportId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.FORMS_SIGNED_UPLOAD_ACK_POST, { fileImportId }),
        method: REQUEST_TYPES.POST,
      }),
    }),
    postInteraction: builder.mutation<PostInteractionResponseType, PostInteractionPayloadType>({
      query: ({ conversationId, messageId, params, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.INTERACTION_POST, { conversationId, messageId }),
        method: REQUEST_TYPES.POST,
        params,
        body,
      }),
    }),
    postInteractionDisable: builder.mutation<PostInteractionResponseType, PostInteractionDisablePayloadType>({
      query: ({ conversationId, messageId, params }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.INTERACTION_DISABLE_POST, { conversationId, messageId }),
        method: REQUEST_TYPES.POST,
        params,
      }),
    }),
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
    getOutputFileDownload: builder.query<GetFileDownloadUrlResponseType, GetOutputFileDownloadRequestType>({
      query: ({ conversationId, filename }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.GET_OUTPUT_FILE_DOWNLOAD, { conversationId, filename }),
      }),
    }),
    submitChatFeedback: builder.mutation<SubmitChatFeedbackResponseType, SubmitChatFeedbackRequestType>({
      query: ({ conversationId, messageId, body }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.SUBMIT_CHAT_FEEDBACK, { conversationId, messageId }),
        method: REQUEST_TYPES.POST,
        body,
      }),
    }),
    stopConversation: builder.mutation<StopConversationResponseType, StopConversationPayloadType>({
      query: ({ conversationId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.STOP_CONVERSATION, { conversationId }),
        method: REQUEST_TYPES.POST,
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
  useGetSignedUrlMutation,
  usePostFormsSignedUploadAckMutation,
  usePostInteractionMutation,
  usePostInteractionDisableMutation,
  useGetSpeechToTextAccessTokenQuery,
  useLazyGetSpeechToTextAccessTokenQuery,
  useLazyGetOutputFileDownloadQuery,
  useSubmitChatFeedbackMutation,
  useStopConversationMutation,
} = ConversationService;
