export const TAB_KIND = {
  CHAT: 'chat',
  TASKS: 'tasks',
  AGENTS: 'agents',
  APPS: 'apps',
  SETTINGS: 'settings',
} as const;

export type TabKindType = (typeof TAB_KIND)[keyof typeof TAB_KIND];

export type TabIdType = string;

export interface TabRightPanelStateType {
  isOpen: boolean;
  panelId?: string;
  width?: number;
  state?: Record<string, unknown>;
}

export interface TabRecordType {
  kind: TabKindType;
  instanceId?: string;
  lastSubRoute: string;
  scrollTop: number;
  uiState: Record<string, unknown>;
  rightPanel?: TabRightPanelStateType;
  lastVisitedAt: number;
}

export interface WorkspaceTabsStateType {
  activeTabId: TabIdType | null;
  byTab: Record<TabIdType, TabRecordType>;
}

export interface ResolveTabType {
  tabId: TabIdType;
  kind: TabKindType;
  instanceId?: string;
}
