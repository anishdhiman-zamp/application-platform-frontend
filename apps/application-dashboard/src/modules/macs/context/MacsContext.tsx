'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { MacsContextType, SectionType, Tab } from '@/modules/macs/types';
import { ViewMode } from '@/modules/macs/types';

const MacsContext = createContext<MacsContextType | null>(null);

export const MacsProvider = ({ children }: { children: ReactNode }) => {
  const [activeSection, setActiveSection] = useState<SectionType | null>(null);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Default);
  const [isAddTabMenuOpen, setIsAddTabMenuOpen] = useState(false);
  const [chatTitle, setChatTitle] = useState('');

  const hasContent = activeSection !== null || tabs.length > 0;

  const toggleSection = useCallback((section: SectionType) => {
    setActiveSection((prev) => {
      if (prev === section) {
        // Closing section - show add tab menu if no tabs
        setTabs((currentTabs) => {
          if (currentTabs.length === 0) {
            setViewMode((currentMode) => (currentMode === ViewMode.Default ? ViewMode.Split : currentMode));
            setIsAddTabMenuOpen(true);
          } else {
            setActiveTabId(currentTabs[0].id);
          }

          return currentTabs;
        });

        return null;
      }

      // Opening section - preserve view mode if already expanded, otherwise go to split
      setActiveTabId(null);
      setViewMode((currentMode) => (currentMode === ViewMode.Default ? ViewMode.Split : currentMode));

      return section;
    });
  }, []);

  const addTab = useCallback((tab: Tab) => {
    setActiveSection(null);
    setViewMode((currentMode) => (currentMode === ViewMode.Default ? ViewMode.Split : currentMode));

    setTabs((prev) => {
      const exists = prev.some((t) => t.id === tab.id);

      setActiveTabId(tab.id);

      return exists ? prev : [...prev, tab];
    });
  }, []);

  const removeTab = useCallback((tabId: string) => {
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId);

      setActiveTabId((currentActiveId) => {
        if (currentActiveId === tabId) {
          return newTabs.length > 0 ? newTabs[0].id : null;
        }

        return currentActiveId;
      });

      setActiveSection((currentSection) => {
        if (newTabs.length === 0 && currentSection === null) {
          setViewMode((currentMode) => (currentMode === ViewMode.Default ? ViewMode.Split : currentMode));
          setIsAddTabMenuOpen(true);
        }

        return currentSection;
      });

      return newTabs;
    });
  }, []);

  const setActiveTab = useCallback((tabId: string | null) => {
    if (tabId) {
      setActiveSection(null);
      setViewMode((currentMode) => (currentMode === ViewMode.Default ? ViewMode.Split : currentMode));
    }
    setActiveTabId(tabId);
  }, []);

  const resetToDefault = useCallback(() => {
    setActiveSection(null);
    setTabs([]);
    setActiveTabId(null);
    setViewMode(ViewMode.Default);
    setIsAddTabMenuOpen(false);
  }, []);

  const openSplitViewWithMenu = useCallback(() => {
    setViewMode(ViewMode.Split);
    setIsAddTabMenuOpen(true);
  }, []);

  const value: MacsContextType = useMemo(
    () => ({
      activeSection,
      toggleSection,
      tabs,
      activeTabId,
      addTab,
      removeTab,
      setActiveTab,
      hasContent,
      viewMode,
      setViewMode,
      openSplitViewWithMenu,
      resetToDefault,
      isAddTabMenuOpen,
      setIsAddTabMenuOpen,
      chatTitle,
      setChatTitle,
    }),
    [
      activeSection,
      toggleSection,
      tabs,
      activeTabId,
      addTab,
      removeTab,
      setActiveTab,
      hasContent,
      viewMode,
      openSplitViewWithMenu,
      resetToDefault,
      isAddTabMenuOpen,
      chatTitle,
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
