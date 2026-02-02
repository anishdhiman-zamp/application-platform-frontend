import { REQUEST_TYPES } from '@zamp-platform/api';
import { API_ENDPOINTS } from 'apis/apiEndpoint.constants';
import { APITags } from '@/constants/api.constants';
import { baseApi } from '@/services/baseApi';
import {
  CreateTriggerSubscriptionRequestType,
  DeleteTriggerSubscriptionRequestType,
  GetTriggerSubscriptionRequestType,
  GetTriggerSubscriptionsForResourceRequestType,
  SuccessResponseType,
  TriggerSubscriptionResponseType,
} from '@/types/api/triggers';
import { formRequestUrlWithParams } from '@/utils/common';

export const Triggers = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createTriggerSubscription: builder.mutation<TriggerSubscriptionResponseType, CreateTriggerSubscriptionRequestType>({
      query: (body) => ({
        url: API_ENDPOINTS.TRIGGER_SUBSCRIPTIONS_POST,
        method: REQUEST_TYPES.POST,
        body,
      }),
      invalidatesTags: [APITags.GET_TRIGGER_SUBSCRIPTIONS_FOR_RESOURCE],
    }),
    getTriggerSubscription: builder.query<TriggerSubscriptionResponseType, GetTriggerSubscriptionRequestType>({
      query: ({ subscription_id }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.TRIGGER_SUBSCRIPTIONS_GET_BY_ID, {
          subscription_id,
        }),
      }),
    }),
    getTriggerSubscriptionsForResource: builder.query<
      TriggerSubscriptionResponseType[],
      GetTriggerSubscriptionsForResourceRequestType
    >({
      query: ({ resource_type, resource_id }) => ({
        url: API_ENDPOINTS.TRIGGER_SUBSCRIPTIONS_GET,
        params: {
          resource_type,
          resource_id,
        },
      }),
      providesTags: [APITags.GET_TRIGGER_SUBSCRIPTIONS_FOR_RESOURCE],
    }),
    deleteTriggerSubscription: builder.mutation<SuccessResponseType, DeleteTriggerSubscriptionRequestType>({
      query: ({ subscription_id }) => ({
        url: formRequestUrlWithParams(API_ENDPOINTS.TRIGGER_SUBSCRIPTIONS_DELETE, {
          subscription_id,
        }),
        method: REQUEST_TYPES.DELETE,
      }),
      async onQueryStarted({ subscription_id }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update: remove the trigger from all matching queries
        const patchResults: Array<{ undo: () => void }> = [];

        // Get the API state to find all matching queries
        const state = getState() as unknown as { api: { queries: Record<string, any> } };
        const queries = state.api?.queries || {};

        // Find all queries for getTriggerSubscriptionsForResource and update them optimistically
        Object.keys(queries).forEach((queryKey) => {
          // RTK Query stores queries with keys like: 'getTriggerSubscriptionsForResource({"resource_type":"process","resource_id":"..."})'
          if (queryKey.startsWith('getTriggerSubscriptionsForResource')) {
            const queryEntry = queries[queryKey];

            if (queryEntry?.data && Array.isArray(queryEntry.data) && queryEntry.originalArgs) {
              try {
                const patchResult = dispatch(
                  Triggers.util.updateQueryData(
                    'getTriggerSubscriptionsForResource',
                    queryEntry.originalArgs,
                    (draft) => {
                      const index = draft.findIndex((sub) => sub.id === subscription_id);

                      if (index !== -1) {
                        draft.splice(index, 1);
                      }
                    },
                  ),
                );

                patchResults.push(patchResult);
              } catch {
                // If updateQueryData fails (e.g., args don't match exactly), skip this query
                // The invalidation will handle refreshing the data
              }
            }
          }
        });

        try {
          await queryFulfilled;
        } catch {
          // Rollback on error - restore the deleted trigger in all queries
          patchResults.forEach((result) => result.undo());
        }
      },
      invalidatesTags: [APITags.GET_TRIGGER_SUBSCRIPTIONS_FOR_RESOURCE],
    }),
  }),
});

export const {
  useCreateTriggerSubscriptionMutation,
  useGetTriggerSubscriptionQuery,
  useLazyGetTriggerSubscriptionQuery,
  useGetTriggerSubscriptionsForResourceQuery,
  useLazyGetTriggerSubscriptionsForResourceQuery,
  useDeleteTriggerSubscriptionMutation,
} = Triggers;
