import { createSlice } from '@reduxjs/toolkit';

export type BreadcrumbItem = {
  title: string;
  href?: string;
};

export type LayoutConfigState = {
  modalStack: string[];
  fullPageLayoutStack: string[];
  isSidebarOpen: boolean;
};

const initialState: LayoutConfigState = {
  modalStack: [],
  fullPageLayoutStack: [],
  isSidebarOpen: false,
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
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;

      return state;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;

      return state;
    },
    openSidebar: (state) => {
      state.isSidebarOpen = true;

      return state;
    },
  },
});

export const {
  addModal,
  removeModal,
  addFullPageLayout,
  removeFullPageLayout,
  toggleSidebar,
  closeSidebar,
  openSidebar,
} = layoutConfigsSlice.actions;

export default layoutConfigsSlice.reducer;
