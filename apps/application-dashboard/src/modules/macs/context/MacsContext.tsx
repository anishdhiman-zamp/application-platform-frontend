'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { MacsContextType, SectionType, Tab } from '@/modules/macs/types';

const MacsContext = createContext<MacsContextType | null>(null);

export const MacsProvider = ({ children }: { children: ReactNode }) => {
  const [openSections, setOpenSections] = useState<SectionType[]>([]);
  const [additionalTabs, setAdditionalTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string>('');
  const [isChatPanelExpanded, setIsChatPanelExpanded] = useState<boolean>(false);
  const [isSectionPanelExpanded, setIsSectionPanelExpanded] = useState<boolean>(false);

  const toggleSection = useCallback(
    (section: SectionType) => {
      setOpenSections((prev) => {
        // If section is already open, close it
        if (prev.includes(section)) {
          if (additionalTabs.length === 0) {
            setIsSectionPanelExpanded(false);
          } else {
            // Auto-select first tab when closing section, show split view
            setActiveTabId(additionalTabs[0].id);
            setIsSectionPanelExpanded(false);
          }

          return [];
        }
        // Open the section (closes any other open section and deselects active tab)
        setActiveTabId(null);
        setIsSectionPanelExpanded(true);

        return [section];
      });
    },
    [additionalTabs],
  );

  const closeSection = useCallback(
    (section: SectionType) => {
      setOpenSections((prev) => {
        if (!prev.includes(section)) return prev;

        if (additionalTabs.length === 0) {
          setIsSectionPanelExpanded(false);
        } else {
          // Auto-select first tab when closing section, show split view
          setActiveTabId(additionalTabs[0].id);
          setIsSectionPanelExpanded(false);
        }

        return [];
      });
    },
    [additionalTabs],
  );

  const addTab = useCallback((tab: Tab) => {
    // Close any open section when adding/switching to a tab
    setOpenSections([]);
    // Keep section panel in split view (not expanded)
    setIsSectionPanelExpanded(false);

    setAdditionalTabs((prev) => {
      if (prev.some((t) => t.id === tab.id)) {
        setActiveTabId(tab.id);

        return prev;
      }
      setActiveTabId(tab.id);

      return [...prev, tab];
    });
  }, []);

  const removeTab = useCallback(
    (tabId: string) => {
      setAdditionalTabs((prev) => {
        const newTabs = prev.filter((t) => t.id !== tabId);

        if (activeTabId === tabId) {
          setActiveTabId(newTabs.length > 0 ? newTabs[0].id : null);
        }

        if (newTabs.length === 0 && openSections.length === 0) {
          setIsSectionPanelExpanded(false);
        }

        return newTabs;
      });
    },
    [activeTabId, openSections.length],
  );

  const setActiveTab = useCallback((tabId: string | null) => {
    // Close any open section when switching to a tab
    if (tabId) {
      setOpenSections([]);
    }
    setActiveTabId(tabId);
  }, []);

  const resetToDefault = useCallback(() => {
    setOpenSections([]);
    setAdditionalTabs([]);
    setActiveTabId(null);
    setIsSectionPanelExpanded(false);
    setIsChatPanelExpanded(false);
  }, [setIsSectionPanelExpanded, setIsChatPanelExpanded]);

  const allTabs = useMemo(() => additionalTabs, [additionalTabs]);

  const hasTabs = openSections.length > 0 || additionalTabs.length > 0;

  const value: MacsContextType = useMemo(
    () => ({
      openSections,
      additionalTabs,
      activeTabId,
      allTabs,
      hasTabs,
      toggleSection,
      addTab,
      removeTab,
      setActiveTab,
      closeSection,
      resetToDefault,
      chatTitle,
      setChatTitle,
      isChatPanelExpanded,
      setIsChatPanelExpanded,
      isSectionPanelExpanded,
      setIsSectionPanelExpanded,
    }),
    [
      openSections,
      additionalTabs,
      activeTabId,
      allTabs,
      hasTabs,
      toggleSection,
      addTab,
      removeTab,
      setActiveTab,
      closeSection,
      resetToDefault,
      chatTitle,
      setChatTitle,
      isChatPanelExpanded,
      setIsChatPanelExpanded,
      isSectionPanelExpanded,
      setIsSectionPanelExpanded,
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
