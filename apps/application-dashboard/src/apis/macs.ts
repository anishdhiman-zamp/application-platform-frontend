import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { baseApi } from '@/services/baseApi';
import type { OpenFeedbackResponseType } from '@/types/api/feedbacks.types';

const MACS = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversationHistory: builder.query<
      OpenFeedbackResponseType,
      { resourceType: string; resourceId: string; page?: number; limit?: number }
    >({
      query: ({ resourceType, resourceId, page, limit }) => ({
        url: API_ENDPOINTS.CONVERSATION_HISTORY_GET,
        params: {
          resource_type: resourceType,
          resource_id: resourceId,
          page,
          limit,
        },
      }),
    }),
  }),
});

export const { useGetConversationHistoryQuery } = MACS;
