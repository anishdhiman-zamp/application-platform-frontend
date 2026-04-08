import { createListenerMiddleware, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import { DynamicTab, DynamicTabType, TAB_TYPE } from '@/modules/pace/pace.types';
import {
  getFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@/utils/localstorage';

interface DynamicTabsState {
  tabs: DynamicTab[];
  activeTabId: string | null;
}

const hydrateTabsFromStorage = (): DynamicTab[] => {
  try {
    const stored = getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS);

    if (!stored) return [];
    const tabs = JSON.parse(stored) as DynamicTab[];

    return tabs.map((tab) => ({
      ...tab,
      stableKey: tab.stableKey || crypto.randomUUID(),
      type: tab.type ?? TAB_TYPE.FILE,
    }));
  } catch {
    return [];
  }
};

const persistTabs = (tabs: DynamicTab[]) => {
  try {
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS, JSON.stringify(tabs));
  } catch {
    // silent
  }
};

const initialState: DynamicTabsState = {
  tabs: hydrateTabsFromStorage(),
  activeTabId: null,
};

export const dynamicTabsSlice = createSlice({
  name: 'dynamicTabs',
  initialState,
  reducers: {
    openTab: (state, action: PayloadAction<Omit<DynamicTab, 'stableKey'>>) => {
      const tab = action.payload;
      const tabType = tab.type ?? TAB_TYPE.FILE;
      const exists = state.tabs.some((t) => t.id === tab.id && (t.type ?? TAB_TYPE.FILE) === tabType);

      if (!exists) {
        state.tabs.push({
          ...tab,
          type: tabType,
          stableKey: crypto.randomUUID(),
        });
      }

      state.activeTabId = tab.id;
    },

    closeTab: (state, action: PayloadAction<string>) => {
      state.tabs = state.tabs.filter((tab) => tab.id !== action.payload);

      if (state.activeTabId === action.payload) {
        state.activeTabId = null;
      }
    },

    setActiveTab: (state, action: PayloadAction<string | null>) => {
      state.activeTabId = action.payload;
    },

    updateTab: (state, action: PayloadAction<{ oldId: string; newTab: Omit<DynamicTab, 'stableKey'> }>) => {
      const { oldId, newTab } = action.payload;
      const tabIndex = state.tabs.findIndex((tab) => tab.id === oldId);

      if (tabIndex === -1) return;

      const existingTab = state.tabs[tabIndex];

      state.tabs[tabIndex] = {
        ...newTab,
        type: newTab.type ?? existingTab.type ?? TAB_TYPE.FILE,
        stableKey: existingTab.stableKey,
      };

      if (state.activeTabId === oldId) {
        state.activeTabId = newTab.id;
      }
    },

    reorderTabs: (state, action: PayloadAction<string[]>) => {
      const newOrder = action.payload;
      const tabMap = new Map(state.tabs.map((tab) => [tab.id, tab]));
      const reordered = newOrder.map((id) => tabMap.get(id)).filter((tab): tab is DynamicTab => tab !== undefined);

      if (reordered.length !== state.tabs.length) return;

      state.tabs = reordered;
    },

    clearAllTabs: (state) => {
      state.tabs = [];
      state.activeTabId = null;
    },
  },
});

export const dynamicTabsActions = dynamicTabsSlice.actions;

export const selectDynamicTabs = (state: { dynamicTabs: DynamicTabsState }) => state.dynamicTabs.tabs;
export const selectActiveTabId = (state: { dynamicTabs: DynamicTabsState }) => state.dynamicTabs.activeTabId;
export const selectActiveTab = (state: { dynamicTabs: DynamicTabsState }) => {
  const { tabs, activeTabId } = state.dynamicTabs;

  if (!activeTabId) return null;

  return tabs.find((tab) => tab.id === activeTabId) ?? null;
};
export const selectTabsByType = (state: { dynamicTabs: DynamicTabsState }, type: DynamicTabType) =>
  state.dynamicTabs.tabs.filter((tab) => (tab.type ?? TAB_TYPE.FILE) === type);

export const dynamicTabsListenerMiddleware = createListenerMiddleware();

dynamicTabsListenerMiddleware.startListening({
  matcher: isAnyOf(
    dynamicTabsActions.openTab,
    dynamicTabsActions.closeTab,
    dynamicTabsActions.updateTab,
    dynamicTabsActions.reorderTabs,
    dynamicTabsActions.clearAllTabs,
  ),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as { dynamicTabs: DynamicTabsState };

    if (state.dynamicTabs.tabs.length === 0) {
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS);
    } else {
      persistTabs(state.dynamicTabs.tabs);
    }
  },
});

export default dynamicTabsSlice.reducer;
