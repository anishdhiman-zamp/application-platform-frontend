import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetFeedbacksQuery } from '@/apis/feedback';
import { setFeedbackItems, setLoading, setProcessId } from '@/store/slices/feedback.slice';

/**
 * Hook to initialize feedbacks fetching for a given processId
 * Replaces FeedbackProvider component
 */
export const useFeedbacksProvider = (processId: string) => {
  const dispatch = useDispatch();
  const { data: feedbacksList, isLoading: isLoadingFeedbacks } = useGetFeedbacksQuery(
    { process_id: processId },
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

  return { isLoading: isLoadingFeedbacks };
};
