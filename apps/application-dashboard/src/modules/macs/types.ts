export enum SectionType {
  Skills = 'skills',
}

export enum ViewMode {
  Default = 'default',
  Split = 'split',
  SectionExpanded = 'section-expanded',
}

export type MacsContextType = {
  activeSection: SectionType | null;
  toggleSection: (section: SectionType) => void;
  hasContent: boolean;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  openSplitViewWithMenu: () => void;
  resetToDefault: () => void;
  chatTitle: string;
  setChatTitle: (title: string) => void;
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  onChatExpandView: () => void;
};
