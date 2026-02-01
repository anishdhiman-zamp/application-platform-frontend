import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BaseEventPayload, EVENT_TYPE } from '@zamp-platform/utils/event-bus/event-bus.types';
import { useGetFeedbacksQuery, useGetOpenFeedbackQuery } from '@/apis/feedback';
import { useEventBus } from '@/app/_providers/sse-provider';
import { mergeOpenFeedbackItems } from '@/modules/chatbot/utils';
import { CONVERSATION_EVENT_TYPE, FEEDBACK_EVENT_TYPE } from '@/modules/feedback/feedback.constants';
import { RootState } from '@/store';
import {
  addFeedbackItem,
  removeOpenFeedbackConversation,
  setFeedbackItems,
  setLoading,
  setMergedFeedbackItems,
  setOpenFeedbackConversations,
  setProcessId,
} from '@/store/slices/feedback.slice';
import { FeedbackItemType } from '@/types/api/feedbacks.types';
import { MapAny } from '@/types/commonTypes';

/**
 * Hook to initialize feedbacks fetching for a given processId
 * Replaces FeedbackProvider component
 */
export const useFeedbacksProvider = (processId: string) => {
  const dispatch = useDispatch();
  const { sseEventBus } = useEventBus();
  const feedbackItems = useSelector((state: RootState) => state?.feedbacks?.feedbackItems);

  const {
    data: feedbacksList,
    isLoading: isLoadingFeedbacks,
    refetch: refetchFeedbacks,
  } = useGetFeedbacksQuery({ process_id: processId }, { skip: !processId });

  const { data: openFeedbackItems, isLoading: isLoadingOpenFeedback } = useGetOpenFeedbackQuery(
    { processId: processId ?? '' },
    { skip: !processId },
  );

  useEffect(() => {
    if (processId) {
      dispatch(setProcessId(processId));
    }
  }, [dispatch, processId]);

  useEffect(() => {
    dispatch(setLoading(isLoadingFeedbacks));
  }, [dispatch, isLoadingFeedbacks]);

  useEffect(() => {
    if (feedbacksList?.feedbacks) {
      dispatch(setFeedbackItems(feedbacksList.feedbacks));
    }
  }, [dispatch, feedbacksList?.feedbacks]);

  useEffect(() => {
    if (openFeedbackItems?.conversations) {
      dispatch(setOpenFeedbackConversations(openFeedbackItems.conversations));
    }
  }, [dispatch, openFeedbackItems?.conversations]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.FEEDBACK, (data: BaseEventPayload) => {
      const payload = data?.payload as MapAny;

      if (data?.source_id !== processId) return;

      switch (payload?.type) {
        case FEEDBACK_EVENT_TYPE.CREATED:
          dispatch(addFeedbackItem(payload?.feedback as FeedbackItemType));

          return;
        default:
          refetchFeedbacks();

          return;
      }
    });

    const conversationSub = sseEventBus.subscribe(EVENT_TYPE.CONVERSATION_V2, (data: BaseEventPayload) => {
      const payload = data?.payload as MapAny;

      switch (payload?.type) {
        case CONVERSATION_EVENT_TYPE.MOVED_TO_FEEDBACK:
          dispatch(removeOpenFeedbackConversation(data.source_id as string));
          break;
      }
    });

    return () => {
      sub.unsubscribe();
      conversationSub.unsubscribe();
    };
  }, [sseEventBus, refetchFeedbacks, processId]);

  // Update merged feedback items when feedbackItems or openFeedbackItems change
  useEffect(() => {
    const merged = mergeOpenFeedbackItems(feedbackItems, openFeedbackItems?.conversations);

    dispatch(setMergedFeedbackItems(merged));
  }, [feedbackItems, openFeedbackItems?.conversations, dispatch]);

  return { isLoading: isLoadingFeedbacks, isLoadingOpenFeedback };
};
