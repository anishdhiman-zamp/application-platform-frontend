'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SIDEBAR_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { CHAT_SIDEBAR_STATE, type ChatSidebarState, DynamicTab, TAB_TYPE } from 'modules/pace/pace.types';
import { getRouteSignificantUrl, getStoredTabs, setStoredTabs } from 'modules/pace/pace.utils';
import { usePathname, useSearchParams } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { defaultFnType } from '@/types/commonTypes';

export interface PendingFileReference {
  path: string;
  name: string;
}

interface PaceContextType {
  chatSidebarState: ChatSidebarState;
  prevChatSidebarState: ChatSidebarState;
  setChatSidebarState: (state: ChatSidebarState) => void;
  collapseSidebar: defaultFnType;

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const startNewChatRef = useRef<defaultFnType | null>(null);

  const [dynamicTabs, setDynamicTabs] = useState<DynamicTab[]>([]);
  const [prevChatSidebarState, setPrevChatSidebarState] = useState<ChatSidebarState>(CHAT_SIDEBAR_STATE.COLLAPSED);
  const [chatSidebarState, setChatSidebarStateRaw] = useState<ChatSidebarState>(CHAT_SIDEBAR_STATE.COLLAPSED);
  const [isDynamicTabsHydrated, setIsDynamicTabsHydrated] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [pendingFileReference, setPendingFileReference] = useState<PendingFileReference | null>(null);

  const routeUrl = getRouteSignificantUrl(pathname, searchParams);
  const prevRouteUrlRef = useRef(routeUrl);
  const chatSidebarStateRef = useRef(chatSidebarState);

  chatSidebarStateRef.current = chatSidebarState;
  const isOnChatRoute = pathname === ROUTES_PATH.CHAT;

  const setChatSidebarStateInternal = useCallback((next: ChatSidebarState) => {
    setChatSidebarStateRaw((prev) => {
      setPrevChatSidebarState(prev);

      return next;
    });
  }, []);

  const setChatSidebarState = useCallback((state: ChatSidebarState) => {
    setChatSidebarStateInternal(state);
  }, []);

  const collapseSidebar = useCallback(() => {
    setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.COLLAPSED);
  }, []);

  const clearPendingFileReference = useCallback(() => {
    setPendingFileReference(null);
  }, []);

  useEffect(() => {
    if (prevRouteUrlRef.current === routeUrl) {
      return;
    }
    prevRouteUrlRef.current = routeUrl;

    if (isOnChatRoute) {
      setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.EXPANDED);
    } else if (chatSidebarStateRef.current === CHAT_SIDEBAR_STATE.EXPANDED) {
      setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.COLLAPSED);
    }
  }, [routeUrl, isOnChatRoute]);

  useEffect(() => {
    const storedTabs = getStoredTabs();

    setDynamicTabs(storedTabs);
    setIsDynamicTabsHydrated(true);

    const currentPath = window.location.pathname;
    const isChatPath = currentPath === ROUTES_PATH.CHAT;
    const hasSidebarConversation = new URLSearchParams(window.location.search).has(SIDEBAR_CONVERSATION_ID_PARAM);

    if (isChatPath) {
      setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.EXPANDED);
    } else if (hasSidebarConversation) {
      setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.SIDEBAR);
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
      chatSidebarState,
      prevChatSidebarState,
      setChatSidebarState,
      collapseSidebar,

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
      chatSidebarState,
      prevChatSidebarState,
      setChatSidebarState,
      collapseSidebar,

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
