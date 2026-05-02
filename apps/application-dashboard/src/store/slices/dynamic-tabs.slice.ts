import { createListenerMiddleware, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import { DynamicTab, DynamicTabType, TAB_TYPE } from '@/modules/pace/pace.types';
import {
  getFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@/utils/localstorage';

interface ConversationTabsState {
  tabs: DynamicTab[];
  activeTabId: string | null;
}

interface DynamicTabsState {
  activeConversationId: string | null;
  byConversation: Record<string, ConversationTabsState>;
}

const normalizeTab = (tab: DynamicTab): DynamicTab => ({
  ...tab,
  stableKey: tab.stableKey || crypto.randomUUID(),
  type: tab.type ?? TAB_TYPE.FILE,
});

const hydrateByConversationFromStorage = (): Record<string, ConversationTabsState> => {
  removeFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS);

  try {
    const stored = getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS_BY_CONVERSATION);

    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, ConversationTabsState>;

    if (!parsed || typeof parsed !== 'object') return {};

    const result: Record<string, ConversationTabsState> = {};

    Object.entries(parsed).forEach(([conversationId, bucket]) => {
      if (!bucket || !Array.isArray(bucket.tabs)) return;
      result[conversationId] = {
        tabs: bucket.tabs.map(normalizeTab),
        activeTabId: bucket.activeTabId ?? null,
      };
    });

    return result;
  } catch {
    return {};
  }
};

const persistByConversation = (byConversation: Record<string, ConversationTabsState>) => {
  try {
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS_BY_CONVERSATION, JSON.stringify(byConversation));
  } catch {
    // silent
  }
};

const isByConversationEmpty = (byConversation: Record<string, ConversationTabsState>): boolean => {
  const entries = Object.values(byConversation);

  if (entries.length === 0) return true;

  return entries.every((bucket) => bucket.tabs.length === 0);
};

const getActiveBucket = (state: DynamicTabsState): ConversationTabsState | null => {
  if (!state.activeConversationId) return null;

  return state.byConversation[state.activeConversationId] ?? null;
};

const ensureActiveBucket = (state: DynamicTabsState): ConversationTabsState | null => {
  if (!state.activeConversationId) return null;

  if (!state.byConversation[state.activeConversationId]) {
    state.byConversation[state.activeConversationId] = { tabs: [], activeTabId: null };
  }

  return state.byConversation[state.activeConversationId];
};

const initialState: DynamicTabsState = {
  activeConversationId: null,
  byConversation: hydrateByConversationFromStorage(),
};

export const dynamicTabsSlice = createSlice({
  name: 'dynamicTabs',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      const conversationId = action.payload;

      state.activeConversationId = conversationId;

      if (conversationId && !state.byConversation[conversationId]) {
        state.byConversation[conversationId] = { tabs: [], activeTabId: null };
      }
    },

    openTab: (state, action: PayloadAction<Omit<DynamicTab, 'stableKey'>>) => {
      const bucket = ensureActiveBucket(state);

      if (!bucket) return;

      const tab = action.payload;
      const tabType = tab.type ?? TAB_TYPE.FILE;
      const exists = bucket.tabs.some((t) => t.id === tab.id && (t.type ?? TAB_TYPE.FILE) === tabType);

      if (!exists) {
        bucket.tabs.push({
          ...tab,
          type: tabType,
          stableKey: crypto.randomUUID(),
        });
      }

      bucket.activeTabId = tab.id;
    },

    closeTab: (state, action: PayloadAction<string>) => {
      const bucket = getActiveBucket(state);

      if (!bucket) return;

      bucket.tabs = bucket.tabs.filter((tab) => tab.id !== action.payload);

      if (bucket.activeTabId === action.payload) {
        bucket.activeTabId = null;
      }
    },

    setActiveTab: (state, action: PayloadAction<string | null>) => {
      const bucket = getActiveBucket(state);

      if (!bucket) return;

      bucket.activeTabId = action.payload;
    },

    updateTab: (state, action: PayloadAction<{ oldId: string; newTab: Omit<DynamicTab, 'stableKey'> }>) => {
      const bucket = getActiveBucket(state);

      if (!bucket) return;

      const { oldId, newTab } = action.payload;
      const tabIndex = bucket.tabs.findIndex((tab) => tab.id === oldId);

      if (tabIndex === -1) return;

      const existingTab = bucket.tabs[tabIndex];

      bucket.tabs[tabIndex] = {
        ...newTab,
        type: newTab.type ?? existingTab.type ?? TAB_TYPE.FILE,
        stableKey: existingTab.stableKey,
      };

      if (bucket.activeTabId === oldId) {
        bucket.activeTabId = newTab.id;
      }
    },

    reorderTabs: (state, action: PayloadAction<string[]>) => {
      const bucket = getActiveBucket(state);

      if (!bucket) return;

      const newOrder = action.payload;
      const tabMap = new Map(bucket.tabs.map((tab) => [tab.id, tab]));
      const reordered = newOrder.map((id) => tabMap.get(id)).filter((tab): tab is DynamicTab => tab !== undefined);

      if (reordered.length !== bucket.tabs.length) return;

      bucket.tabs = reordered;
    },

    clearAllTabs: (state) => {
      const bucket = getActiveBucket(state);

      if (!bucket) return;

      bucket.tabs = [];
      bucket.activeTabId = null;
    },
  },
});

export const dynamicTabsActions = dynamicTabsSlice.actions;

const EMPTY_TABS: DynamicTab[] = [];

const getActiveBucketReadonly = (state: { dynamicTabs: DynamicTabsState }): ConversationTabsState | null => {
  const { activeConversationId, byConversation } = state.dynamicTabs;

  if (!activeConversationId) return null;

  return byConversation[activeConversationId] ?? null;
};

export const selectDynamicTabs = (state: { dynamicTabs: DynamicTabsState }) =>
  getActiveBucketReadonly(state)?.tabs ?? EMPTY_TABS;

export const selectActiveTabId = (state: { dynamicTabs: DynamicTabsState }) =>
  getActiveBucketReadonly(state)?.activeTabId ?? null;

export const selectActiveTab = (state: { dynamicTabs: DynamicTabsState }) => {
  const bucket = getActiveBucketReadonly(state);

  if (!bucket || !bucket.activeTabId) return null;

  return bucket.tabs.find((tab) => tab.id === bucket.activeTabId) ?? null;
};

export const selectTabsByType = (state: { dynamicTabs: DynamicTabsState }, type: DynamicTabType) =>
  (getActiveBucketReadonly(state)?.tabs ?? EMPTY_TABS).filter((tab) => (tab.type ?? TAB_TYPE.FILE) === type);

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

    if (isByConversationEmpty(state.dynamicTabs.byConversation)) {
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS_BY_CONVERSATION);
    } else {
      persistByConversation(state.dynamicTabs.byConversation);
    }
  },
});

export default dynamicTabsSlice.reducer;
