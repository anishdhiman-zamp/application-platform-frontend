'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  FILES_PANEL_MAX_WIDTH,
  FILES_PANEL_MIN_WIDTH,
  FILES_PANEL_WIDTH,
  SIDEBAR_CONVERSATION_ID_PARAM,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_WIDTH,
} from 'modules/pace/pace.constants';
import { CHAT_SIDEBAR_STATE, type ChatSidebarState, DynamicTab, TAB_TYPE } from 'modules/pace/pace.types';
import { getStoredTabs, setStoredTabs } from 'modules/pace/pace.utils';
import { usePathname } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useSyncedPathname, useSyncedUrlParam } from '@/modules/pace/hooks/useSyncedSearchParam';
import { defaultFnType } from '@/types/commonTypes';
import {
  getFromLocalStorage,
  LOCAL_STORAGE_KEYS,
  removeFromLocalStorage,
  setToLocalStorage,
} from '@/utils/localstorage';

export interface PendingFileReference {
  path: string;
  name: string;
}

export interface PendingConversationPayload {
  message: string;
  fileReferences?: { path: string; name: string }[];
  llmModel?: string | null;
}

interface PaceContextType {
  chatSidebarState: ChatSidebarState;
  prevChatSidebarState: ChatSidebarState;
  setChatSidebarState: (state: ChatSidebarState) => void;
  collapseSidebar: defaultFnType;

  registerStartNewChat: (callback: defaultFnType) => void;
  startNewChat: defaultFnType;

  registerSelectConversation: (callback: (id: string) => void) => void;
  selectConversation: (id: string) => void;

  dynamicTabs: DynamicTab[];
  isDynamicTabsHydrated: boolean;
  openDynamicTab: (tab: Omit<DynamicTab, 'stableKey'>) => void;
  closeDynamicTab: (id: string) => void;
  updateDynamicTab: (oldId: string, newTab: Omit<DynamicTab, 'stableKey'>) => void;
  reorderDynamicTabs: (newOrder: string[]) => void;

  pendingFileReference: PendingFileReference | null;
  setPendingFileReference: (ref: PendingFileReference | null) => void;
  clearPendingFileReference: defaultFnType;

  pendingConversationPayload: PendingConversationPayload | null;
  setPendingConversationPayload: (payload: PendingConversationPayload | null) => void;

  filesPanelOpen: boolean;
  filesPanelPinned: boolean;
  toggleFilesPanel: defaultFnType;
  setFilesPanelPinned: (pinned: boolean) => void;
  closeFilesPanel: defaultFnType;
  scheduleFilesPanelClose: defaultFnType;
  cancelFilesPanelClose: defaultFnType;

  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  persistSidebarWidth: (width: number) => void;
  isSidebarResizing: boolean;
  setIsSidebarResizing: (resizing: boolean) => void;

  filesPanelWidth: number;
  setFilesPanelWidth: (width: number) => void;
  persistFilesPanelWidth: (width: number) => void;
  isFilesPanelResizing: boolean;
  setIsFilesPanelResizing: (resizing: boolean) => void;
}

const PaceContext = createContext<PaceContextType | null>(null);

export const PaceProvider = ({ children }: { children: ReactNode }) => {
  const nextPathname = usePathname();
  const syncedPathname = useSyncedPathname();
  const fileParam = useSyncedUrlParam('f');
  const filesPanelLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startNewChatRef = useRef<defaultFnType | null>(null);
  const selectConversationRef = useRef<((id: string) => void) | null>(null);

  const [dynamicTabs, setDynamicTabs] = useState<DynamicTab[]>([]);
  const [prevChatSidebarState, setPrevChatSidebarState] = useState<ChatSidebarState>(CHAT_SIDEBAR_STATE.COLLAPSED);
  const [chatSidebarState, setChatSidebarStateRaw] = useState<ChatSidebarState>(CHAT_SIDEBAR_STATE.COLLAPSED);
  const [isDynamicTabsHydrated, setIsDynamicTabsHydrated] = useState(false);
  const [pendingFileReference, setPendingFileReference] = useState<PendingFileReference | null>(null);
  const [pendingConversationPayload, setPendingConversationPayload] = useState<PendingConversationPayload | null>(null);
  const [filesPanelOpen, setFilesPanelOpen] = useState(false);
  const [filesPanelPinned, setFilesPanelPinnedRaw] = useState(false);
  const [sidebarWidth, setSidebarWidthRaw] = useState(SIDEBAR_WIDTH);
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);
  const [filesPanelWidth, setFilesPanelWidthRaw] = useState(FILES_PANEL_WIDTH);
  const [isFilesPanelResizing, setIsFilesPanelResizing] = useState(false);

  const pathname = syncedPathname || nextPathname;
  const hasFileParam = fileParam !== null;
  const routeUrl = hasFileParam ? `${pathname}?f=${fileParam}` : pathname;
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

  const setFilesPanelPinned = useCallback((pinned: boolean) => {
    setFilesPanelPinnedRaw(pinned);
    setFilesPanelOpen(true);
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_PINNED, JSON.stringify(pinned));
  }, []);

  const setSidebarWidth = useCallback((width: number) => {
    const clamped = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));

    setSidebarWidthRaw(clamped);
  }, []);

  const persistSidebarWidth = useCallback((width: number) => {
    const clamped = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));

    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_SIDEBAR_WIDTH, String(clamped));
  }, []);

  const setFilesPanelWidth = useCallback((width: number) => {
    const clamped = Math.min(FILES_PANEL_MAX_WIDTH, Math.max(FILES_PANEL_MIN_WIDTH, width));

    setFilesPanelWidthRaw(clamped);
  }, []);

  const persistFilesPanelWidth = useCallback((width: number) => {
    const clamped = Math.min(FILES_PANEL_MAX_WIDTH, Math.max(FILES_PANEL_MIN_WIDTH, width));

    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_WIDTH, String(clamped));
  }, []);

  const toggleFilesPanel = useCallback(() => {
    if (filesPanelPinned) {
      setFilesPanelPinned(false);
      setFilesPanelOpen(false);

      return;
    }
    setFilesPanelOpen((prev) => !prev);
  }, [filesPanelPinned, setFilesPanelPinned]);

  const closeFilesPanel = useCallback(() => {
    setFilesPanelOpen(false);
  }, []);

  const cancelFilesPanelClose = useCallback(() => {
    if (filesPanelLeaveTimerRef.current) {
      clearTimeout(filesPanelLeaveTimerRef.current);
      filesPanelLeaveTimerRef.current = null;
    }
  }, []);

  const scheduleFilesPanelClose = useCallback(() => {
    cancelFilesPanelClose();
    filesPanelLeaveTimerRef.current = setTimeout(() => {
      setFilesPanelOpen(false);
      filesPanelLeaveTimerRef.current = null;
    }, 200);
  }, [cancelFilesPanelClose]);

  const registerStartNewChat = useCallback((callback: defaultFnType) => {
    startNewChatRef.current = callback;
  }, []);

  const startNewChat = useCallback(() => {
    startNewChatRef.current?.();
  }, []);

  const registerSelectConversation = useCallback((callback: (id: string) => void) => {
    selectConversationRef.current = callback;
  }, []);

  const selectConversation = useCallback((id: string) => {
    selectConversationRef.current?.(id);
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

  useEffect(() => {
    if (prevRouteUrlRef.current === routeUrl) {
      return;
    }
    prevRouteUrlRef.current = routeUrl;

    if (chatSidebarStateRef.current === CHAT_SIDEBAR_STATE.EXPANDED) {
      setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.COLLAPSED);
    }
  }, [routeUrl, isOnChatRoute, hasFileParam]);

  const clampSidebarWidthToFilesPanel = useCallback(() => {
    if (!(filesPanelOpen && filesPanelPinned)) return;
    if (chatSidebarStateRef.current !== CHAT_SIDEBAR_STATE.SIDEBAR) return;

    const containerWidth = window.innerWidth - 16;
    const filesPanelSpace = filesPanelWidth + 8;
    const available = containerWidth - 8 - 100 - filesPanelSpace;
    const effectiveMax = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, available));

    setSidebarWidthRaw((prev) => {
      if (prev <= effectiveMax) return prev;

      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_SIDEBAR_WIDTH, String(effectiveMax));

      return effectiveMax;
    });
  }, [filesPanelOpen, filesPanelPinned, filesPanelWidth]);

  useEffect(() => {
    if (!(filesPanelOpen && filesPanelPinned)) return;
    if (chatSidebarStateRef.current !== CHAT_SIDEBAR_STATE.SIDEBAR) return;

    const containerWidth = window.innerWidth - 16;
    const sidebarSpace = sidebarWidth + 8;
    const available = containerWidth - 8 - 100 - sidebarSpace;
    const effectiveMax = Math.min(FILES_PANEL_MAX_WIDTH, Math.max(FILES_PANEL_MIN_WIDTH, available));

    setFilesPanelWidthRaw((prev) => {
      if (prev <= effectiveMax) return prev;

      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_WIDTH, String(effectiveMax));

      return effectiveMax;
    });
  }, [filesPanelOpen, filesPanelPinned, sidebarWidth]);

  useEffect(() => {
    clampSidebarWidthToFilesPanel();
  }, [clampSidebarWidthToFilesPanel]);

  useEffect(() => {
    const storedTabs = getStoredTabs();

    setDynamicTabs(storedTabs);
    setIsDynamicTabsHydrated(true);

    const storedPinned = getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_PINNED);

    if (storedPinned) {
      try {
        const pinned = JSON.parse(storedPinned);

        setFilesPanelPinnedRaw(pinned);
        if (pinned) {
          setFilesPanelOpen(true);
        }
      } catch {
        removeFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_PINNED);
      }
    }

    const storedSidebarWidth = getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_SIDEBAR_WIDTH);

    if (storedSidebarWidth) {
      const parsed = Number(storedSidebarWidth);

      if (!Number.isNaN(parsed)) {
        setSidebarWidthRaw(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, parsed)));
      }
    }

    const storedFilesPanelWidth = getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_WIDTH);

    if (storedFilesPanelWidth) {
      const parsed = Number(storedFilesPanelWidth);

      if (!Number.isNaN(parsed)) {
        setFilesPanelWidthRaw(Math.min(FILES_PANEL_MAX_WIDTH, Math.max(FILES_PANEL_MIN_WIDTH, parsed)));
      }
    }

    const currentPath = window.location.pathname;
    const currentSearch = new URLSearchParams(window.location.search);
    const isChatPath = currentPath === ROUTES_PATH.CHAT;
    const hasFileParamOnMount = currentSearch.has('f');
    const hasSidebarConversation = currentSearch.has(SIDEBAR_CONVERSATION_ID_PARAM);

    if (isChatPath && !hasFileParamOnMount && hasSidebarConversation) {
      setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.EXPANDED);
    } else if (hasSidebarConversation) {
      setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.SIDEBAR);
    }
  }, []);

  const value: PaceContextType = useMemo(
    () => ({
      chatSidebarState,
      prevChatSidebarState,
      setChatSidebarState,
      collapseSidebar,

      registerStartNewChat,
      startNewChat,

      registerSelectConversation,
      selectConversation,

      dynamicTabs,
      isDynamicTabsHydrated,
      openDynamicTab,
      closeDynamicTab,
      updateDynamicTab,
      reorderDynamicTabs,

      pendingFileReference,
      setPendingFileReference,
      clearPendingFileReference,

      pendingConversationPayload,
      setPendingConversationPayload,

      filesPanelOpen,
      filesPanelPinned,
      toggleFilesPanel,
      setFilesPanelPinned,
      closeFilesPanel,
      scheduleFilesPanelClose,
      cancelFilesPanelClose,

      sidebarWidth,
      setSidebarWidth,
      persistSidebarWidth,
      isSidebarResizing,
      setIsSidebarResizing,

      filesPanelWidth,
      setFilesPanelWidth,
      persistFilesPanelWidth,
      isFilesPanelResizing,
      setIsFilesPanelResizing,
    }),
    [
      chatSidebarState,
      prevChatSidebarState,
      setChatSidebarState,
      collapseSidebar,

      registerStartNewChat,
      startNewChat,

      registerSelectConversation,
      selectConversation,

      dynamicTabs,
      isDynamicTabsHydrated,
      openDynamicTab,
      closeDynamicTab,
      updateDynamicTab,
      reorderDynamicTabs,

      pendingFileReference,
      clearPendingFileReference,

      pendingConversationPayload,

      filesPanelOpen,
      filesPanelPinned,
      toggleFilesPanel,
      setFilesPanelPinned,
      closeFilesPanel,
      scheduleFilesPanelClose,
      cancelFilesPanelClose,

      sidebarWidth,
      setSidebarWidth,
      persistSidebarWidth,
      isSidebarResizing,

      filesPanelWidth,
      setFilesPanelWidth,
      persistFilesPanelWidth,
      isFilesPanelResizing,
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
