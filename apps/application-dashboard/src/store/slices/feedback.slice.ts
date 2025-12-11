import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { convertOpenFeedbackToFeedbackItem } from '@/modules/chatbot/utils';
import { FEEDBACK_STATUS } from '@/modules/feedback/feedback.constants';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

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

interface FeedbacksState {
  openFeedbackItems: FeedbackItemType[];
  queuedFeedbackItems: FeedbackItemType[];
  processingFeedbackItems: FeedbackItemType[];
  successFeedbackItems: FeedbackItemType[];
  feedbackItems: FeedbackItemType[];
  mergedFeedbackItems: FeedbackItemType[];
  openFeedbackConversations: FeedbackItemType[];
  isLoading: boolean;
  processId: string;
  hasFeedback: boolean;
}

const initialState: FeedbacksState = {
  openFeedbackItems: [],
  queuedFeedbackItems: [],
  processingFeedbackItems: [],
  successFeedbackItems: [],
  feedbackItems: [],
  mergedFeedbackItems: [],
  openFeedbackConversations: [],
  isLoading: false,
  processId: '',
  hasFeedback: false,
};

export const feedbacksSlice = createSlice({
  name: 'feedbacks',
  initialState,
  reducers: {
    setFeedbackItems: (state, action: PayloadAction<FeedbackItemType[]>) => {
      const splitFeedbacks = splitFeedbacksByStatus(action.payload);

      state.feedbackItems = action.payload;
      state.openFeedbackItems = splitFeedbacks.openFeedbackItems;
      state.queuedFeedbackItems = splitFeedbacks.queuedFeedbackItems;
      state.processingFeedbackItems = splitFeedbacks.processingFeedbackItems;
      state.successFeedbackItems = splitFeedbacks.successFeedbackItems;
      state.hasFeedback = !!action.payload?.length;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setProcessId: (state, action: PayloadAction<string>) => {
      state.processId = action.payload;
    },
    removeFeedbackItem: (state, action: PayloadAction<{ id: string; status: FEEDBACK_STATUS }>) => {
      const { id, status } = action.payload;

      state.feedbackItems = state.feedbackItems.filter((item) => item.id !== id);

      switch (status) {
        case FEEDBACK_STATUS.OPEN:
          state.openFeedbackItems = state.openFeedbackItems.filter((i) => i.id !== id);
          break;
        case FEEDBACK_STATUS.QUEUED:
          state.queuedFeedbackItems = state.queuedFeedbackItems.filter((i) => i.id !== id);
          break;
        case FEEDBACK_STATUS.PROCESSING:
          state.processingFeedbackItems = state.processingFeedbackItems.filter((i) => i.id !== id);
          break;
        case FEEDBACK_STATUS.APPLIED:
          state.successFeedbackItems = state.successFeedbackItems.filter((i) => i.id !== id);
          break;
      }

      // Recalculate hasFeedback
      state.hasFeedback = state.feedbackItems.length > 0;
    },
    setMergedFeedbackItems: (state, action: PayloadAction<FeedbackItemType[]>) => {
      state.mergedFeedbackItems = action.payload;
    },
    setOpenFeedbackConversations: (state, action: PayloadAction<FeedbackItemType[]>) => {
      state.openFeedbackConversations = action.payload;
    },
    removeOpenFeedbackConversation: (state, action: PayloadAction<string>) => {
      state.openFeedbackConversations = state.openFeedbackConversations.filter((item) => item.id !== action.payload);
      state.mergedFeedbackItems = state.mergedFeedbackItems.filter((item) => item.conversation_id !== action.payload);
    },
    addFeedbackItem: (state, action: PayloadAction<FeedbackItemType>) => {
      const feedbackFromOpenFeedback = state.mergedFeedbackItems.find(
        (item) => item.id === action.payload.conversation_id,
      );

      if (feedbackFromOpenFeedback) {
        state.mergedFeedbackItems = state.mergedFeedbackItems.map((item) =>
          item.id === action.payload.conversation_id
            ? { ...item, status: FEEDBACK_STATUS.OPEN, feedback_id: action.payload.id }
            : item,
        );
        state.openFeedbackItems = [action.payload, ...state.openFeedbackItems];
        state.openFeedbackConversations = state.openFeedbackConversations.filter(
          (item) => item.id !== action.payload.conversation_id,
        );
      } else {
        state.mergedFeedbackItems = [...state.mergedFeedbackItems, action.payload];
        state.feedbackItems = [action.payload, ...state.feedbackItems];
        state.openFeedbackItems = [action.payload, ...state.openFeedbackItems];
      }
    },
    addOpenFeedbackConversation: (state, action: PayloadAction<FeedbackItemType>) => {
      const exists = state.openFeedbackConversations.some((item) => item.id === action.payload.id);

      if (!exists) {
        state.openFeedbackConversations = [action.payload, ...state.openFeedbackConversations];
        state.mergedFeedbackItems = [...state.mergedFeedbackItems, convertOpenFeedbackToFeedbackItem(action.payload)];
      }
    },
  },
});

export const {
  setFeedbackItems,
  setLoading,
  setProcessId,
  removeFeedbackItem,
  setMergedFeedbackItems,
  setOpenFeedbackConversations,
  removeOpenFeedbackConversation,
  addOpenFeedbackConversation,
  addFeedbackItem,
} = feedbacksSlice.actions;

export default feedbacksSlice.reducer;
