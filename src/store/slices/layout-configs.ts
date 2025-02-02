import { createSlice } from '@reduxjs/toolkit';

export type UserState = {
  modalStack: string[];
  fullPageLayoutStack: string[];
  breadcrumbStack: string[];
};

const initialState: UserState = {
  modalStack: [],
  fullPageLayoutStack: [],
  breadcrumbStack: [],
};

export const layoutConfigsSlice = createSlice({
  name: 'layoutConfigs',
  initialState,
  reducers: {
    addModal: (state, action) => {
      state.modalStack = [...state.modalStack, action.payload];

      return state;
    },
    removeModal: (state, action) => {
      state.modalStack = state.modalStack.filter((modal) => modal !== action.payload);

      return state;
    },
    addFullPageLayout: (state, action) => {
      state.fullPageLayoutStack = [...state.fullPageLayoutStack, action.payload];

      return state;
    },
    removeFullPageLayout: (state, action) => {
      state.fullPageLayoutStack = state.fullPageLayoutStack.filter((layout) => layout !== action.payload);

      return state;
    },
    addBreadcrumb: (state, action) => {
      state.breadcrumbStack = [...state.breadcrumbStack, action.payload];

      return state;
    },
    removeBreadcrumb: (state, action) => {
      state.breadcrumbStack = state.breadcrumbStack.filter((breadcrumb) => breadcrumb !== action.payload);

      return state;
    },
    resetBreadcrumb: (state, action) => {
      state.breadcrumbStack = action.payload ?? [];

      return state;
    },
  },
});

export const {
  addModal,
  removeModal,
  addFullPageLayout,
  removeFullPageLayout,
  addBreadcrumb,
  removeBreadcrumb,
  resetBreadcrumb,
} = layoutConfigsSlice.actions;

export default layoutConfigsSlice.reducer;
