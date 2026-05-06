import { createListenerMiddleware, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import { TASK_QUERY_PARAMS } from '@/constants/routeConfig';
import { TAB_QUERY_PARAM } from '@/modules/pace/pace.types';
import {
  type TabIdType,
  type TabKindType,
  type TabRecordType,
  type TabRightPanelStateType,
  type WorkspaceTabsStateType,
} from '@/types/workspace-tabs.types';
import {
  getFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@/utils/localstorage';
import {
  getFromSessionStorage,
  removeFromSessionStorage,
  SESSION_STORAGE_KEYS,
  setToSessionStorage,
} from '@/utils/sessionstorage';

const emptyTab = (kind: TabKindType, instanceId?: string): TabRecordType => ({
  kind,
  instanceId,
  lastSubRoute: '',
  scrollTop: 0,
  uiState: {},
  rightPanel: undefined,
  lastVisitedAt: 0,
});

const PANEL_ROUTE_PARAMS = [
  TAB_QUERY_PARAM.FILE,
  TAB_QUERY_PARAM.TASK,
  TAB_QUERY_PARAM.AGENT,
  'title',
  'description',
  'avatarKey',
  'status',
  'currentIndex',
  'totalRows',
  TASK_QUERY_PARAMS.PARENT_TASKS,
  TASK_QUERY_PARAMS.SIBLINGS,
  TASK_QUERY_PARAMS.REFERRER,
] as const;

export const stripPanelParamsFromRoute = (route: string): string => {
  if (!route) return route;

  try {
    const url = new URL(route, 'https://zamp.local');

    PANEL_ROUTE_PARAMS.forEach((param) => url.searchParams.delete(param));

    const query = url.searchParams.toString();

    return `${url.pathname}${query ? `?${query}` : ''}${url.hash}`;
  } catch {
    return route;
  }
};

const normalizeStoredRecord = (record: TabRecordType, stripPanels: boolean): TabRecordType => ({
  kind: record.kind,
  instanceId: record.instanceId,
  lastSubRoute: stripPanels ? stripPanelParamsFromRoute(record.lastSubRoute ?? '') : (record.lastSubRoute ?? ''),
  scrollTop: 0,
  uiState: record.uiState ?? {},
  rightPanel: stripPanels ? undefined : record.rightPanel,
  lastVisitedAt: record.lastVisitedAt ?? 0,
});

const parseByTabFromStorage = (
  stored: string | null,
  stripPanels: boolean,
): Record<TabIdType, TabRecordType> | null => {
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as { byTab?: Record<TabIdType, TabRecordType> } | null;

    if (!parsed || typeof parsed !== 'object' || !parsed.byTab) return null;

    const result: Record<TabIdType, TabRecordType> = {};

    Object.entries(parsed.byTab).forEach(([tabId, record]) => {
      if (!record || typeof record !== 'object' || !record.kind) return;
      result[tabId] = normalizeStoredRecord(record, stripPanels);
    });

    return result;
  } catch {
    return null;
  }
};

const hydrateByTabFromStorage = (): Record<TabIdType, TabRecordType> => {
  const sessionTabs = parseByTabFromStorage(getFromSessionStorage(SESSION_STORAGE_KEYS.WORKSPACE_TABS), false);

  if (sessionTabs) return sessionTabs;

  return parseByTabFromStorage(getFromLocalStorage(LOCAL_STORAGE_KEYS.WORKSPACE_TABS), true) ?? {};
};

const serializeByTab = (byTab: Record<TabIdType, TabRecordType>, stripPanels: boolean) => {
  const serializable: Record<TabIdType, Omit<TabRecordType, 'scrollTop'>> = {};

  Object.entries(byTab).forEach(([tabId, record]) => {
    const { scrollTop: _scrollTop, ...rest } = record;

    serializable[tabId] = stripPanels
      ? {
          ...rest,
          lastSubRoute: stripPanelParamsFromRoute(rest.lastSubRoute),
          rightPanel: undefined,
        }
      : rest;
  });

  return JSON.stringify({ byTab: serializable });
};

const persistByTab = (byTab: Record<TabIdType, TabRecordType>) => {
  try {
    setToSessionStorage(SESSION_STORAGE_KEYS.WORKSPACE_TABS, serializeByTab(byTab, false));
  } catch {
    // silent
  }

  try {
    setToLocalStorage(LOCAL_STORAGE_KEYS.WORKSPACE_TABS, serializeByTab(byTab, true));
  } catch {
    // silent
  }
};

const initialState: WorkspaceTabsStateType = {
  activeTabId: null,
  byTab: hydrateByTabFromStorage(),
};

const ensureRecord = (state: WorkspaceTabsStateType, tabId: TabIdType, kind: TabKindType, instanceId?: string) => {
  if (!state.byTab[tabId]) {
    state.byTab[tabId] = emptyTab(kind, instanceId);
  }

  return state.byTab[tabId];
};

export const workspaceTabsSlice = createSlice({
  name: 'workspaceTabs',
  initialState,
  reducers: {
    setActiveTab: (
      state,
      action: PayloadAction<{ tabId: TabIdType; kind: TabKindType; instanceId?: string } | null>,
    ) => {
      const payload = action.payload;

      if (!payload) {
        state.activeTabId = null;

        return;
      }

      const record = ensureRecord(state, payload.tabId, payload.kind, payload.instanceId);

      record.lastVisitedAt = Date.now();
      state.activeTabId = payload.tabId;
    },

    setLastSubRoute: (state, action: PayloadAction<{ tabId: TabIdType; subRoute: string }>) => {
      const record = state.byTab[action.payload.tabId];

      if (!record) return;

      record.lastSubRoute = action.payload.subRoute;
    },

    setScrollTop: (state, action: PayloadAction<{ tabId: TabIdType; scrollTop: number }>) => {
      const record = state.byTab[action.payload.tabId];

      if (!record) return;

      record.scrollTop = action.payload.scrollTop;
    },

    patchTabUiState: (state, action: PayloadAction<{ tabId: TabIdType; patch: Record<string, unknown> }>) => {
      const record = state.byTab[action.payload.tabId];

      if (!record) return;

      record.uiState = { ...record.uiState, ...action.payload.patch };
    },

    setRightPanel: (state, action: PayloadAction<{ tabId: TabIdType; panel: TabRightPanelStateType | undefined }>) => {
      const record = state.byTab[action.payload.tabId];

      if (!record) return;

      record.rightPanel = action.payload.panel;
    },

    clearTab: (state, action: PayloadAction<TabIdType>) => {
      delete state.byTab[action.payload];

      if (state.activeTabId === action.payload) {
        state.activeTabId = null;
      }
    },

    clearTabsByKind: (state, action: PayloadAction<TabKindType>) => {
      Object.entries(state.byTab).forEach(([tabId, record]) => {
        if (record.kind === action.payload) {
          delete state.byTab[tabId];

          if (state.activeTabId === tabId) {
            state.activeTabId = null;
          }
        }
      });
    },
  },
});

export const workspaceTabsActions = workspaceTabsSlice.actions;

export const selectActiveTabId = (state: { workspaceTabs: WorkspaceTabsStateType }) => state.workspaceTabs.activeTabId;

export const selectActiveTabKind = (state: { workspaceTabs: WorkspaceTabsStateType }) => {
  const id = state.workspaceTabs.activeTabId;

  if (!id) return null;

  return state.workspaceTabs.byTab[id]?.kind ?? null;
};

export const selectTabRecord = (tabId: TabIdType | null) => (state: { workspaceTabs: WorkspaceTabsStateType }) => {
  if (!tabId) return null;

  return state.workspaceTabs.byTab[tabId] ?? null;
};

export const selectActiveTabRecord = (state: { workspaceTabs: WorkspaceTabsStateType }) => {
  const id = state.workspaceTabs.activeTabId;

  if (!id) return null;

  return state.workspaceTabs.byTab[id] ?? null;
};

export const selectRightPanel = (tabId: TabIdType | null) => (state: { workspaceTabs: WorkspaceTabsStateType }) => {
  if (!tabId) return null;

  return state.workspaceTabs.byTab[tabId]?.rightPanel ?? null;
};

export const workspaceTabsListenerMiddleware = createListenerMiddleware();

workspaceTabsListenerMiddleware.startListening({
  matcher: isAnyOf(
    workspaceTabsActions.setLastSubRoute,
    workspaceTabsActions.patchTabUiState,
    workspaceTabsActions.setRightPanel,
    workspaceTabsActions.clearTab,
    workspaceTabsActions.clearTabsByKind,
    workspaceTabsActions.setActiveTab,
  ),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as { workspaceTabs: WorkspaceTabsStateType };

    if (Object.keys(state.workspaceTabs.byTab).length === 0) {
      removeFromSessionStorage(SESSION_STORAGE_KEYS.WORKSPACE_TABS);
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.WORKSPACE_TABS);

      return;
    }

    persistByTab(state.workspaceTabs.byTab);
  },
});

export default workspaceTabsSlice.reducer;
