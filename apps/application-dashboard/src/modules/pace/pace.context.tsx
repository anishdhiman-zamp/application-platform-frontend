'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DynamicTab, TAB_TYPE } from 'modules/pace/pace.types';
import { SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';
import { defaultFnType } from '@/types/commonTypes';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

const getStoredTabs = (): DynamicTab[] => {
  try {
    const stored = getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_OPEN_DYNAMIC_TABS);

    if (!stored) return [];
    const tabs = JSON.parse(stored) as DynamicTab[];

    return tabs.map((tab) => ({
      ...tab,
      stableKey: tab.stableKey || crypto.randomUUID(),
      type: tab.type ?? TAB_TYPE.FILE,
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

export interface PendingFileReference {
  path: string;
  name: string;
}

interface PaceContextType {
  isPaceSidebarOpen: boolean;
  setIsPaceSidebarOpen: (open: boolean) => void;
  registerStartNewChat: (callback: defaultFnType) => void;
  startNewChat: defaultFnType;
  dynamicTabs: DynamicTab[];
  isDynamicTabsHydrated: boolean;
  openDynamicTab: (tab: Omit<DynamicTab, 'stableKey'>) => void;
  closeDynamicTab: (id: string) => void;
  updateDynamicTab: (oldId: string, newTab: Omit<DynamicTab, 'stableKey'>) => void;
  reorderDynamicTabs: (newOrder: string[]) => void;
  activeTabId: string | null;
  setActiveTabId: (id: string | null) => void;
  pendingFileReference: PendingFileReference | null;
  setPendingFileReference: (ref: PendingFileReference | null) => void;
  clearPendingFileReference: defaultFnType;
}

const PaceContext = createContext<PaceContextType | null>(null);

export const PaceProvider = ({ children }: { children: ReactNode }) => {
  const [isPaceSidebarOpen, setIsPaceSidebarOpen] = useState(false);
  const [dynamicTabs, setDynamicTabs] = useState<DynamicTab[]>([]);
  const [isDynamicTabsHydrated, setIsDynamicTabsHydrated] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [pendingFileReference, setPendingFileReference] = useState<PendingFileReference | null>(null);
  const startNewChatRef = useRef<defaultFnType | null>(null);

  const clearPendingFileReference = useCallback(() => {
    setPendingFileReference(null);
  }, []);

  useEffect(() => {
    const storedTabs = getStoredTabs();

    setDynamicTabs(storedTabs);
    setIsDynamicTabsHydrated(true);

    const params = new URLSearchParams(window.location.search);
    const sidebarConvId = params.get(SIDEBAR_CONVERSATION_ID_PARAM);

    if (sidebarConvId) {
      setIsPaceSidebarOpen(true);
    }
  }, []);

  const registerStartNewChat = useCallback((callback: defaultFnType) => {
    startNewChatRef.current = callback;
  }, []);

  const startNewChat = useCallback(() => {
    startNewChatRef.current?.();
  }, []);

  const openDynamicTab = useCallback((tab: Omit<DynamicTab, 'stableKey'>) => {
    setDynamicTabs((prev) => {
      const exists = prev.some((t) => t.id === tab.id && t.type === (tab.type ?? TAB_TYPE.FILE));

      if (exists) return prev;

      const newTab: DynamicTab = {
        ...tab,
        type: tab.type ?? TAB_TYPE.FILE,
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
        type: newTab.type ?? existingTab.type ?? TAB_TYPE.FILE,
        stableKey: existingTab.stableKey,
      };
      setStoredTabs(newTabs);

      return newTabs;
    });
  }, []);

  const reorderDynamicTabs = useCallback((newOrder: string[]) => {
    setDynamicTabs((prev) => {
      const tabMap = new Map(prev.map((tab) => [tab.id, tab]));

      const reorderedTabs = newOrder.map((id) => tabMap.get(id)).filter((tab): tab is DynamicTab => tab !== undefined);

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
      isDynamicTabsHydrated,
      openDynamicTab,
      closeDynamicTab,
      updateDynamicTab,
      reorderDynamicTabs,
      activeTabId,
      setActiveTabId,
      pendingFileReference,
      setPendingFileReference,
      clearPendingFileReference,
    }),
    [
      isPaceSidebarOpen,
      registerStartNewChat,
      startNewChat,
      dynamicTabs,
      isDynamicTabsHydrated,
      openDynamicTab,
      closeDynamicTab,
      updateDynamicTab,
      reorderDynamicTabs,
      activeTabId,
      pendingFileReference,
      clearPendingFileReference,
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
