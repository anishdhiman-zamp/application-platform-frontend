'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DynamicTab } from 'modules/pace/pace.types';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

const getStoredTabs = (): DynamicTab[] => {
  try {
    const stored = getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS);

    if (!stored) return [];
    const tabs = JSON.parse(stored) as DynamicTab[];

    return tabs.map((tab) => ({
      ...tab,
      stableKey: tab.stableKey || crypto.randomUUID(),
    }));
  } catch (error) {
    console.error('Error getting stored tabs:', error);

    return [];
  }
};

const setStoredTabs = (tabs: DynamicTab[]) => {
  try {
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS, JSON.stringify(tabs));
  } catch (error) {
    console.error('Error setting stored tabs:', error);
  }
};

interface PaceContextType {
  isPaceSidebarOpen: boolean;
  setIsPaceSidebarOpen: (open: boolean) => void;
  registerStartNewChat: (callback: () => void) => void;
  startNewChat: () => void;
  dynamicTabs: DynamicTab[];
  activeFileTabKey: string | null;
  setActiveFileTabKey: (key: string | null) => void;
  openDynamicTab: (tab: Omit<DynamicTab, 'stableKey'>) => void;
  closeDynamicTab: (id: string) => void;
  updateDynamicTab: (oldId: string, newTab: Omit<DynamicTab, 'stableKey'>) => void;
  reorderDynamicTabs: (newOrder: string[]) => void;
}

const PaceContext = createContext<PaceContextType | null>(null);

export const PaceProvider = ({ children }: { children: ReactNode }) => {
  const [isPaceSidebarOpen, setIsPaceSidebarOpen] = useState(false);
  const [dynamicTabs, setDynamicTabs] = useState<DynamicTab[]>([]);
  const [activeFileTabKey, setActiveFileTabKey] = useState<string | null>(null);
  const startNewChatRef = useRef<(() => void) | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedTabs = getStoredTabs();

    if (storedTabs.length > 0) {
      setDynamicTabs(storedTabs);
    }
  }, []);

  const registerStartNewChat = useCallback((callback: () => void) => {
    startNewChatRef.current = callback;
  }, []);

  const startNewChat = useCallback(() => {
    startNewChatRef.current?.();
  }, []);

  const openDynamicTab = useCallback((tab: Omit<DynamicTab, 'stableKey'>) => {
    setDynamicTabs((prev) => {
      const exists = prev.some((t) => t.id === tab.id);

      if (exists) return prev;

      const newTab: DynamicTab = {
        ...tab,
        stableKey: crypto.randomUUID(),
      };

      const newTabs = [...prev, newTab];

      setStoredTabs(newTabs);

      return newTabs;
    });
  }, []);

  const closeDynamicTab = useCallback((id: string) => {
    setDynamicTabs((prev) => {
      const newTabs = prev.filter((tab) => tab.id !== id);

      setStoredTabs(newTabs);

      return newTabs;
    });
  }, []);

  const updateDynamicTab = useCallback((oldId: string, newTab: Omit<DynamicTab, 'stableKey'>) => {
    setDynamicTabs((prev) => {
      const tabIndex = prev.findIndex((tab) => tab.id === oldId);

      if (tabIndex === -1) return prev;

      const existingTab = prev[tabIndex];
      const newTabs = [...prev];

      newTabs[tabIndex] = {
        ...newTab,
        stableKey: existingTab.stableKey,
      };
      setStoredTabs(newTabs);

      return newTabs;
    });
  }, []);

  const reorderDynamicTabs = useCallback((newOrder: string[]) => {
    setDynamicTabs((prev) => {
      // Create a map for quick lookup
      const tabMap = new Map(prev.map((tab) => [tab.id, tab]));

      // Reorder tabs based on the new order
      const reorderedTabs = newOrder.map((id) => tabMap.get(id)).filter((tab): tab is DynamicTab => tab !== undefined);

      // If the reordered tabs don't match the original count, something went wrong
      if (reorderedTabs.length !== prev.length) {
        return prev;
      }

      setStoredTabs(reorderedTabs);

      return reorderedTabs;
    });
  }, []);

  const value: PaceContextType = useMemo(
    () => ({
      isPaceSidebarOpen,
      setIsPaceSidebarOpen,
      registerStartNewChat,
      startNewChat,
      dynamicTabs,
      activeFileTabKey,
      setActiveFileTabKey,
      openDynamicTab,
      closeDynamicTab,
      updateDynamicTab,
      reorderDynamicTabs,
    }),
    [
      isPaceSidebarOpen,
      registerStartNewChat,
      startNewChat,
      dynamicTabs,
      activeFileTabKey,
      openDynamicTab,
      closeDynamicTab,
      updateDynamicTab,
      reorderDynamicTabs,
    ],
  );

  return <PaceContext.Provider value={value}>{children}</PaceContext.Provider>;
};

export const usePaceContext = () => {
  const context = useContext(PaceContext);

  if (!context) {
    throw new Error('usePaceContext must be used within a PaceProvider');
  }

  return context;
};

export default PaceContext;
