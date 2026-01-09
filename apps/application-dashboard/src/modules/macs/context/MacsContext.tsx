'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { MacsContextType } from '@/modules/macs/types';
import { SectionType, ViewMode } from '@/modules/macs/types';

const MacsContext = createContext<MacsContextType | null>(null);

export const MacsProvider = ({ children }: { children: ReactNode }) => {
  const [activeSection, setActiveSection] = useState<SectionType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Default);
  const [chatTitle, setChatTitle] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const hasContent = activeSection !== null;

  const toggleSection = useCallback((section: SectionType) => {
    setActiveSection((prev) => {
      if (prev === section) {
        setViewMode(ViewMode.Default);

        return null;
      }

      setViewMode((currentMode) => (currentMode === ViewMode.Default ? ViewMode.Split : currentMode));

      return section;
    });
  }, []);

  const resetToDefault = useCallback(() => {
    setActiveSection(null);
    setViewMode(ViewMode.Default);
    setChatTitle('');
    setShowHistory(false);
  }, []);

  const openSplitViewWithMenu = useCallback(() => {
    setViewMode(ViewMode.Split);
    setActiveSection((prev) => prev ?? SectionType.Skills);
  }, []);

  const onChatExpandView = useCallback(() => {
    setViewMode(ViewMode.Default);
    setActiveSection(null);
  }, []);

  const value: MacsContextType = useMemo(
    () => ({
      activeSection,
      toggleSection,
      hasContent,
      viewMode,
      setViewMode,
      openSplitViewWithMenu,
      resetToDefault,
      chatTitle,
      setChatTitle,
      showHistory,
      setShowHistory,
      onChatExpandView,
    }),
    [
      activeSection,
      toggleSection,
      hasContent,
      viewMode,
      openSplitViewWithMenu,
      resetToDefault,
      chatTitle,
      showHistory,
      onChatExpandView,
    ],
  );

  return <MacsContext.Provider value={value}>{children}</MacsContext.Provider>;
};

export const useMacsContext = () => {
  const context = useContext(MacsContext);

  if (!context) {
    throw new Error('useMacsContext must be used within a MacsProvider');
  }

  return context;
};

export default MacsContext;
