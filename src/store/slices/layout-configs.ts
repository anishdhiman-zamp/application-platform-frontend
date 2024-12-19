import { createSlice } from '@reduxjs/toolkit';

export type UserState = {
  modalStack: string[];
  fullPageLayoutStack: string[];
};

const initialState: UserState = {
  modalStack: [],
  fullPageLayoutStack: [],
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addModal: (state, action) => {
      state.modalStack = [...state.modalStack, action.payload];
    },
    removeModal: (state, action) => {
      state.modalStack = state.modalStack.filter((modal) => modal !== action.payload);
    },
    addFullPageLayout: (state, action) => {
      state.fullPageLayoutStack = [...state.fullPageLayoutStack, action.payload];
    },
    removeFullPageLayout: (state, action) => {
      state.fullPageLayoutStack = state.fullPageLayoutStack.filter((layout) => layout !== action.payload);
    },
  },
});

export const { addModal, removeModal, addFullPageLayout, removeFullPageLayout } = userSlice.actions;

export default userSlice.reducer;
