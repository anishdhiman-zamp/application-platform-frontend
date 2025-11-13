import { createContext, Dispatch, FC, ReactElement, useContext, useEffect, useReducer } from 'react';
import { MapAny } from 'types/commonTypes';
import { useGetFeedbacksQuery } from '@/apis/feedback';
import { FEEDBACK_STATUS } from '@/modules/feedback/feedback.constants';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

enum feedbackContextActions {
  SET_FEEDBACK_ITEMS = 'SET_FEEDBACK_ITEMS',
  SET_LOADING = 'SET_LOADING',
  SET_PROCESS_ID = 'SET_PROCESS_ID',
  REMOVE_FEEDBACK_ITEM = 'REMOVE_FEEDBACK_ITEM',
}

interface FeedbackContextState {
  openFeedbackItems: FeedbackItemType[];
  queuedFeedbackItems: FeedbackItemType[];
  processingFeedbackItems: FeedbackItemType[];
  successFeedbackItems: FeedbackItemType[];
  allFeedbackItems: FeedbackItemType[];
  isLoading: boolean;
  processId: string;
  hasFeedback: boolean;
}

type SetFeedbackItemsAction = {
  type: 'SET_FEEDBACK_ITEMS';
  payload: { feedbacks: FeedbackItemType[] };
};

type SetLoadingAction = {
  type: 'SET_LOADING';
  payload: { isLoading: boolean };
};

type SetProcessIdAction = {
  type: 'SET_PROCESS_ID';
  payload: { processId: string };
};

type RemoveFeedbackItemAction = {
  type: 'REMOVE_FEEDBACK_ITEM';
  payload: { id: string; status: FEEDBACK_STATUS };
};

export type ActionType = SetFeedbackItemsAction | SetLoadingAction | SetProcessIdAction | RemoveFeedbackItemAction;

interface SplitFeedbacksResult {
  openFeedbackItems: FeedbackItemType[];
  queuedFeedbackItems: FeedbackItemType[];
  processingFeedbackItems: FeedbackItemType[];
  successFeedbackItems: FeedbackItemType[];
}

const splitFeedbacksByStatus = (feedbacks: FeedbackItemType[]): SplitFeedbacksResult => {
  const itemsWithStatus: Partial<Record<FEEDBACK_STATUS, FeedbackItemType[]>> = {};

  for (const item of feedbacks) {
    const statusKey = item.status as FEEDBACK_STATUS;

    if (Object.values(FEEDBACK_STATUS).includes(statusKey)) {
      (itemsWithStatus[statusKey] ||= []).push(item);
    }
  }

  return {
    openFeedbackItems: itemsWithStatus[FEEDBACK_STATUS.OPEN] ?? [],
    queuedFeedbackItems: itemsWithStatus[FEEDBACK_STATUS.QUEUED] ?? [],
    processingFeedbackItems: itemsWithStatus[FEEDBACK_STATUS.PROCESSING] ?? [],
    successFeedbackItems: itemsWithStatus[FEEDBACK_STATUS.APPLIED] ?? [],
  };
};

const initialState: FeedbackContextState = {
  openFeedbackItems: [],
  queuedFeedbackItems: [],
  processingFeedbackItems: [],
  successFeedbackItems: [],
  allFeedbackItems: [],
  isLoading: false,
  processId: '',
  hasFeedback: false,
};

const context = createContext<{
  state: FeedbackContextState;
  dispatch: Dispatch<ActionType>;
}>({
  state: initialState,
  dispatch: () => null,
});

const { Provider } = context;

interface FeedbackProviderProps {
  children: ReactElement;
  processId: string;
}

export const FeedbackProvider: FC<FeedbackProviderProps> = ({ children, processId }) => {
  const { data: feedbacksList, isLoading: isLoadingFeedbacks } = useGetFeedbacksQuery(
    { process_id: processId },
    { skip: !processId },
  );

  const [state, dispatch] = useReducer((state: FeedbackContextState, action: ActionType): FeedbackContextState => {
    switch (action.type) {
      case feedbackContextActions.SET_FEEDBACK_ITEMS: {
        const splitFeedbacks = splitFeedbacksByStatus(action.payload.feedbacks);

        return {
          ...state,
          ...splitFeedbacks,
          allFeedbackItems: action.payload.feedbacks,
          hasFeedback: !!action.payload.feedbacks?.length,
        };
      }
      case feedbackContextActions.SET_LOADING:
        return { ...state, isLoading: action.payload.isLoading };
      case feedbackContextActions.SET_PROCESS_ID:
        return { ...state, processId: action.payload.processId };
      case feedbackContextActions.REMOVE_FEEDBACK_ITEM: {
        const { id, status } = action.payload;

        switch (status) {
          case FEEDBACK_STATUS.OPEN:
            return { ...state, openFeedbackItems: state.openFeedbackItems.filter((i) => i.id !== id) };
          case FEEDBACK_STATUS.QUEUED:
            return { ...state, queuedFeedbackItems: state.queuedFeedbackItems.filter((i) => i.id !== id) };
          default:
            return state;
        }
      }
      default:
        return state;
    }
  }, initialState);

  useEffect(() => {
    dispatch({
      type: feedbackContextActions.SET_PROCESS_ID,
      payload: { processId },
    });
  }, [processId]);

  useEffect(() => {
    dispatch({
      type: feedbackContextActions.SET_LOADING,
      payload: { isLoading: isLoadingFeedbacks },
    });
  }, [isLoadingFeedbacks]);

  useEffect(() => {
    dispatch({
      type: feedbackContextActions.SET_FEEDBACK_ITEMS,
      payload: {
        feedbacks: feedbacksList?.feedbacks ?? [],
      },
    });
  }, [feedbacksList?.feedbacks]);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

/* eslint-disable react/display-name */
const withFeedbackContext = (WrappedComponent: FC<any>) => {
  return (props: MapAny) => (
    <FeedbackProvider processId={props.processId}>
      <WrappedComponent {...props} />
    </FeedbackProvider>
  );
};

const useFeedbackContextStore = () => useContext(context);

export { feedbackContextActions, useFeedbackContextStore, withFeedbackContext };
