export enum SectionType {
  Skills = 'skills',
}

export enum TabType {
  Report = 'report',
  Dashboard = 'dashboard',
  Page = 'page',
}

export enum ViewMode {
  Default = 'default', // Chat takes full width (stacked topbars)
  Split = 'split', // Both panels visible (side-by-side)
  SectionExpanded = 'section-expanded', // Section takes full width
}

export type Tab = {
  id: string;
  title: string;
  type: TabType;
  icon?: string;
};

export type RecentItem = {
  id: string;
  title: string;
  type: 'page' | 'dashboard' | 'report';
  icon?: string;
};

export type MacsContextType = {
  // Section state
  activeSection: SectionType | null;
  toggleSection: (section: SectionType) => void;

  // Tab state
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string | null) => void;

  // Derived
  hasContent: boolean;

  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  openSplitViewWithMenu: () => void;
  resetToDefault: () => void;

  // Add tab menu
  isAddTabMenuOpen: boolean;
  setIsAddTabMenuOpen: (open: boolean) => void;

  // Chat
  chatTitle: string;
  setChatTitle: (title: string) => void;
  hasChatMessages: boolean;
  setHasChatMessages: (hasMessages: boolean) => void;
  showHistoryView: boolean;
  setShowHistoryView: (show: boolean) => void;
  startNewChat: () => void;
  registerClearMessages: (clearFn: () => void) => void;
  isNewChat: boolean;
  setIsNewChat: (isNewChat: boolean) => void;
};

export enum TopbarLayoutType {
  Stacked = 'stacked', // Both topbars one above another (default/chat expanded)
  MacsOnly = 'macs-only', // Section expanded
  Split = 'split', // Both topbars side by side
}

export type Skill = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  addedBy: 'you' | 'anthropic';
  createdAt: string;
};

export type ChatHistoryItem = {
  id: string;
  title: string;
  createdAt: string;
  isLatest?: boolean;
};
