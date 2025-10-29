import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import { ArchiveFeedbackPayloadType, FeedbacksResponseType } from '@/types/api/feedbacks.types';

const Feedbacks = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeedbacks: builder.query<FeedbacksResponseType, { process_id: string }>({
      query: ({ process_id }) => ({ url: API_ENDPOINTS.FEEDBACKS_GET, params: { process_id } }),
      providesTags: [APITags.GET_FEEDBACKS],
    }),
    archiveFeedback: builder.mutation<void, ArchiveFeedbackPayloadType>({
      query: (payload) => ({
        url: API_ENDPOINTS.FEEDBACKS_ARCHIVE_POST,
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
      invalidatesTags: (_, error) => (error ? [] : [APITags.GET_FEEDBACKS]),
    }),
    unArchiveFeedback: builder.mutation<void, ArchiveFeedbackPayloadType>({
      query: (payload) => ({
        url: API_ENDPOINTS.FEEDBACKS_UN_ARCHIVE_POST,
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
      invalidatesTags: (_, error) => (error ? [] : [APITags.GET_FEEDBACKS]),
    }),
    applyFeedback: builder.mutation<void, ArchiveFeedbackPayloadType>({
      query: (payload) => ({
        url: API_ENDPOINTS.FEEDBACKS_APPLY_POST,
        method: REQUEST_TYPES.POST,
        body: payload,
      }),
    }),
  }),
});

export const {
  useGetFeedbacksQuery,
  useArchiveFeedbackMutation,
  useUnArchiveFeedbackMutation,
  useApplyFeedbackMutation,
} = Feedbacks;
