import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FeedbackItemType } from '@/types/api/feedbacks.types';

interface FeedbacksState {
  feedbackItems: FeedbackItemType[];
}

const initialState: FeedbacksState = {
  feedbackItems: [],
};

export const feedbacksSlice = createSlice({
  name: 'feedbacks',
  initialState,
  reducers: {
    setFeedbackItems: (state, action: PayloadAction<FeedbackItemType[]>) => {
      state.feedbackItems = action.payload;
    },
    removeFeedbackItem: (state, action: PayloadAction<string>) => {
      state.feedbackItems = state.feedbackItems.filter((item) => item.id !== action.payload);
    },
  },
});

export const { setFeedbackItems, removeFeedbackItem } = feedbacksSlice.actions;

export default feedbacksSlice.reducer;
