import { REQUEST_TYPES } from '@zamp-platform/api';
import { formRequestUrlWithParams } from '@zamp-platform/utils';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import {
  ArchiveFeedbackPayloadType,
  DeleteConversationFeedbackPayloadType,
  FeedbacksResponseType,
  OpenFeedbackResponseType,
  StopProcessingFeedbackPayloadType,
} from '@/types/api/feedbacks.types';

const Feedbacks = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeedbacks: builder.query<FeedbacksResponseType, { process_id: string }>({
      query: ({ process_id }) => ({ url: API_ENDPOINTS.FEEDBACKS_GET, params: { process_id } }),
      providesTags: [APITags.GET_FEEDBACKS],
    }),
    getOpenFeedback: builder.query<OpenFeedbackResponseType, { processId: string; page?: number; limit?: number }>({
      query: ({ processId, page, limit }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.FEEDBACKS_OPEN_GET, { processId }),
        params: { process_id: processId, page, limit },
      }),
    }),
    deleteFeedback: builder.mutation<void, ArchiveFeedbackPayloadType>({
      query: (payload) => ({
        url: API_ENDPOINTS.FEEDBACKS_DELETE_POST,
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
    }),
    deleteConversationFeedback: builder.mutation<void, DeleteConversationFeedbackPayloadType>({
      query: ({ conversationId, resourceType, resourceId }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.FEEDBACKS_CONVERSATION_DELETE, {
          conversationId,
          resourceType,
          resourceId,
        }),
        method: REQUEST_TYPES.DELETE,
      }),
    }),
    applyFeedback: builder.mutation<void, ArchiveFeedbackPayloadType>({
      query: (payload) => ({
        url: API_ENDPOINTS.FEEDBACKS_APPLY_POST,
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
    }),
    stopProcessingFeedback: builder.mutation<void, StopProcessingFeedbackPayloadType>({
      query: (payload) => ({
        url: API_ENDPOINTS.FEEDBACKS_STOP_PROCESSING_POST,
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetFeedbacksQuery,
  useLazyGetFeedbacksQuery,
  useDeleteFeedbackMutation,
  useDeleteConversationFeedbackMutation,
  useApplyFeedbackMutation,
  useStopProcessingFeedbackMutation,
  useGetOpenFeedbackQuery,
  useLazyGetOpenFeedbackQuery,
} = Feedbacks;
