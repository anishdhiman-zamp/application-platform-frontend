export enum SectionType {
  Capabilities = 'capabilities',
  Components = 'components',
}

export enum TabType {
  Report = 'report',
  Dashboard = 'dashboard',
  Page = 'page',
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
  openSections: SectionType[];
  additionalTabs: Tab[];

  activeTabId: string | null;
  allTabs: Tab[];

  hasTabs: boolean;
  toggleSection: (section: SectionType) => void;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string | null) => void;
  closeSection: (section: SectionType) => void;
  resetToDefault: () => void;

  chatTitle: string;
  setChatTitle: (title: string) => void;

  isChatPanelExpanded: boolean;
  setIsChatPanelExpanded: (expanded: boolean) => void;
  isSectionPanelExpanded: boolean;
  setIsSectionPanelExpanded: (expanded: boolean) => void;
};

export enum TopbarLayoutType {
  ChatOnly = 'chat-only',
  MacsOnly = 'macs-only',
  Split = 'split',
}
