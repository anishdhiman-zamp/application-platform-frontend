'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { MacsContextType, SectionType, Tab } from '@/modules/macs/types';

const MacsContext = createContext<MacsContextType | null>(null);

const SECTION_CONFIG: Record<SectionType, { title: string; icon: string }> = {
  capabilities: { title: 'Capabilities', icon: 'puzzle' },
  components: { title: 'Components', icon: 'shapes' },
};

export const MacsProvider = ({ children }: { children: ReactNode }) => {
  const [openSections, setOpenSections] = useState<SectionType[]>([]);
  const [additionalTabs, setAdditionalTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState<string>('');
  const [chatPanelSize, setChatPanelSize] = useState<number>(40);

  const toggleSection = useCallback(
    (section: SectionType) => {
      setOpenSections((prev) => {
        if (prev.includes(section)) {
          // Section is already open, close it
          const newSections = prev.filter((s) => s !== section);

          // If this was the active tab, switch to another
          if (activeTabId === section) {
            const remainingSectionIds = newSections as string[];
            const remainingTabIds = additionalTabs.map((t) => t.id);
            const allRemainingIds = [...remainingSectionIds, ...remainingTabIds];

            setActiveTabId(allRemainingIds.length > 0 ? allRemainingIds[0] : null);
          }

          return newSections;
        } else {
          // Open the section and make it active
          setActiveTabId(section);

          return [...prev, section];
        }
      });
    },
    [activeTabId, additionalTabs],
  );

  const closeSection = useCallback(
    (section: SectionType) => {
      setOpenSections((prev) => {
        const newSections = prev.filter((s) => s !== section);

        if (activeTabId === section) {
          const remainingSectionIds = newSections as string[];
          const remainingTabIds = additionalTabs.map((t) => t.id);
          const allRemainingIds = [...remainingSectionIds, ...remainingTabIds];

          setActiveTabId(allRemainingIds.length > 0 ? allRemainingIds[0] : null);
        }

        return newSections;
      });
    },
    [activeTabId, additionalTabs],
  );

  const addTab = useCallback((tab: Tab) => {
    setAdditionalTabs((prev) => {
      // Don't add if already exists
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
      // Check if it's a section
      if (tabId === 'capabilities' || tabId === 'components') {
        closeSection(tabId as SectionType);

        return;
      }

      setAdditionalTabs((prev) => {
        const newTabs = prev.filter((t) => t.id !== tabId);

        if (activeTabId === tabId) {
          const allRemaining = [...openSections, ...newTabs.map((t) => t.id)];

          setActiveTabId(allRemaining.length > 0 ? allRemaining[0] : null);
        }

        return newTabs;
      });
    },
    [activeTabId, openSections, closeSection],
  );

  const setActiveTab = useCallback((tabId: string | null) => {
    setActiveTabId(tabId);
  }, []);

  const resetToDefault = useCallback(() => {
    setOpenSections([]);
    setAdditionalTabs([]);
    setActiveTabId(null);
  }, []);

  // Convert open sections to Tab format and combine with additional tabs
  const allTabs = useMemo(() => {
    const sectionTabs: Tab[] = openSections.map((section) => ({
      id: section,
      title: SECTION_CONFIG[section].title,
      type: section,
      icon: SECTION_CONFIG[section].icon,
    }));

    return [...sectionTabs, ...additionalTabs];
  }, [openSections, additionalTabs]);

  const hasTabs = allTabs.length > 0;

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
      chatPanelSize,
      setChatPanelSize,
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
      chatPanelSize,
      setChatPanelSize,
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
