import { Action, combineReducers, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { chatApi } from '@zamp-platform/chat';
import layoutConfigsSliceReducer from 'store/slices/layout-configs';
import sheetFiltersSliceReducer from 'store/slices/sheet-filters';
import tableStateSliceReducer from 'store/slices/table-state';
import userSliceReducer from 'store/slices/user';
import { baseApi } from '@/services/baseApi';
import dynamicTabsSliceReducer, { dynamicTabsListenerMiddleware } from '@/store/slices/dynamic-tabs.slice';
import feedbacksSliceReducer from '@/store/slices/feedback.slice';

const reducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  user: userSliceReducer,
  layoutConfig: layoutConfigsSliceReducer,
  sheetFilters: sheetFiltersSliceReducer,
  tableState: tableStateSliceReducer,
  feedbacks: feedbacksSliceReducer,
  dynamicTabs: dynamicTabsSliceReducer,
});

export const store = configureStore({
  reducer: reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(dynamicTabsListenerMiddleware.middleware)
      .concat(baseApi.middleware, chatApi.middleware),
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
