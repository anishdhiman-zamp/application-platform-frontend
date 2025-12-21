export enum SectionType {
  Skills = 'skills',
}

export enum ViewMode {
  Default = 'default', // Chat takes full width (stacked topbars)
  Split = 'split', // Both panels visible (side-by-side)
  SectionExpanded = 'section-expanded', // Section takes full width
}

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

  // Derived
  hasContent: boolean;

  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  openSplitViewWithMenu: () => void;
  resetToDefault: () => void;

  // Chat
  chatTitle: string;
  setChatTitle: (title: string) => void;
  hasChatMessages: boolean;
  setHasChatMessages: (hasMessages: boolean) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
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
