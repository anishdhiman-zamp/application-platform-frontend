export type SectionType = 'capabilities' | 'components';

export type TabType = SectionType | 'report' | 'dashboard' | 'page';

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
  // Section icons state (which are currently open as tabs)
  openSections: SectionType[];

  // Additional tabs (from + button)
  additionalTabs: Tab[];

  // Active tab
  activeTabId: string | null;

  // Full page section (when section is opened full-screen, not as tab)
  fullPageSection: SectionType | null;

  // Computed - all tabs (sections + additional)
  allTabs: Tab[];

  // Whether any tabs are open
  hasTabs: boolean;

  // Actions
  toggleSection: (section: SectionType) => void;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string | null) => void;
  closeSection: (section: SectionType) => void;
  resetToDefault: () => void;
  setFullPageSection: (section: SectionType | null) => void;

  // Chat state
  chatTitle: string;
  setChatTitle: (title: string) => void;

  // Panel sizing
  chatPanelSize: number;
  setChatPanelSize: (size: number) => void;
};
