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
import { CHAT_SIDEBAR_STATE, type ChatSidebarState } from 'modules/pace/pace.types';
import { getInitialSidebarState, getInitialWidth } from 'modules/pace/pace.utils';
import { usePathname } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import { selectActiveTabId } from '@/store/slices/dynamic-tabs.slice';
import { defaultFnType } from '@/types/commonTypes';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

export interface PendingFileReference {
  path: string;
  name: string;
}

export interface ChatMessageIntent {
  message: string;
  fileReferences?: { path: string; name: string }[];
  llmModel?: string | null;
  metadata?: Record<string, unknown>;
  autoLoopEnabled?: boolean;
}

export interface ActiveAgentInfo {
  id: string;
  name: string;
  avatar?: string;
  autoLoopEnabled?: boolean;
}

interface PaceContextType {
  chatSidebarState: ChatSidebarState;
  prevChatSidebarState: ChatSidebarState;
  setChatSidebarState: (state: ChatSidebarState) => void;
  collapseSidebar: defaultFnType;
  scheduleCollapseOnRouteChange: defaultFnType;

  registerStartNewChat: (callback: defaultFnType) => void;
  startNewChat: defaultFnType;

  registerSelectConversation: (callback: (id: string, title?: string) => void) => void;
  selectConversation: (id: string, title?: string) => void;

  pendingFileReference: PendingFileReference | null;
  setPendingFileReference: (ref: PendingFileReference | null) => void;
  clearPendingFileReference: defaultFnType;

  chatMessageIntent: ChatMessageIntent | null;
  setChatMessageIntent: (payload: ChatMessageIntent | null) => void;

  activeAgentInfo: ActiveAgentInfo | null;
  setActiveAgentInfo: (info: ActiveAgentInfo | null) => void;

  filesPanelOpen: boolean;
  filesPanelPinned: boolean;
  isFilesPanelHydrated: boolean;
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

  selectedModel: string | null;
  setSelectedModel: (modelId: string | null) => void;
}

const PaceContext = createContext<PaceContextType | null>(null);

interface InitialFilesPanelState {
  open: boolean;
  pinned: boolean;
}

const getInitialFilesPanelState = (): InitialFilesPanelState => {
  if (typeof window === 'undefined') return { open: false, pinned: false };

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_PINNED);
    const pinned = stored ? (JSON.parse(stored) as boolean) : false;

    return { open: pinned, pinned };
  } catch {
    return { open: false, pinned: false };
  }
};

export const PaceProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const activeTabId = useAppSelector(selectActiveTabId);
  const filesPanelLeaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCollapseRef = useRef(false);
  const startNewChatRef = useRef<defaultFnType | null>(null);
  const selectConversationRef = useRef<((id: string, title?: string) => void) | null>(null);

  const [chatSidebarState, setChatSidebarStateRaw] = useState<ChatSidebarState>(getInitialSidebarState);
  const [prevChatSidebarState, setPrevChatSidebarState] = useState<ChatSidebarState>(chatSidebarState);
  const [pendingFileReference, setPendingFileReference] = useState<PendingFileReference | null>(null);
  const [chatMessageIntent, setChatMessageIntent] = useState<ChatMessageIntent | null>(null);
  const [activeAgentInfo, setActiveAgentInfo] = useState<ActiveAgentInfo | null>(null);
  const initialFilesPanelState = useRef(getInitialFilesPanelState());
  const [filesPanelOpen, setFilesPanelOpen] = useState(initialFilesPanelState.current.open);
  const [filesPanelPinned, setFilesPanelPinnedRaw] = useState(initialFilesPanelState.current.pinned);
  const [isFilesPanelHydrated, setIsFilesPanelHydrated] = useState(false);
  const [sidebarWidth, setSidebarWidthRaw] = useState(() =>
    getInitialWidth(LOCAL_STORAGE_KEYS.PACE_SIDEBAR_WIDTH, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH, SIDEBAR_WIDTH),
  );
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);
  const [filesPanelWidth, setFilesPanelWidthRaw] = useState(() =>
    getInitialWidth(
      LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_WIDTH,
      FILES_PANEL_MIN_WIDTH,
      FILES_PANEL_MAX_WIDTH,
      FILES_PANEL_WIDTH,
    ),
  );
  const [isFilesPanelResizing, setIsFilesPanelResizing] = useState(false);
  const [selectedModel, setSelectedModelRaw] = useState<string | null>(
    getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_SELECTED_MODEL),
  );

  const routeSignature = activeTabId ? `${pathname}:${activeTabId}` : pathname;
  const prevRouteSignatureRef = useRef(routeSignature);
  const prevPathnameRef = useRef(pathname);
  const prevActiveTabIdRef = useRef(activeTabId);
  const chatSidebarStateRef = useRef(chatSidebarState);

  chatSidebarStateRef.current = chatSidebarState;

  const setChatSidebarStateInternal = useCallback((next: ChatSidebarState) => {
    setChatSidebarStateRaw((prev) => {
      setPrevChatSidebarState(prev);

      return next;
    });
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_SIDEBAR_STATE, next);
  }, []);

  const setChatSidebarState = useCallback((state: ChatSidebarState) => {
    setChatSidebarStateInternal(state);
  }, []);

  const collapseSidebar = useCallback(() => {
    setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.COLLAPSED);
  }, []);

  const scheduleCollapseOnRouteChange = useCallback(() => {
    pendingCollapseRef.current = true;
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

  const setSelectedModel = useCallback((modelId: string | null) => {
    setSelectedModelRaw(modelId);

    if (modelId) {
      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_SELECTED_MODEL, modelId);
    }
  }, []);

  const registerStartNewChat = useCallback((callback: defaultFnType) => {
    startNewChatRef.current = callback;
  }, []);

  const startNewChat = useCallback(() => {
    startNewChatRef.current?.();
  }, []);

  const registerSelectConversation = useCallback((callback: (id: string, title?: string) => void) => {
    selectConversationRef.current = callback;
  }, []);

  const selectConversation = useCallback((id: string, title?: string) => {
    selectConversationRef.current?.(id, title);
  }, []);

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

  const handlePendingCollapse = useCallback(
    (isTabIdOnlyChange: boolean) => {
      pendingCollapseRef.current = false;

      const hasSidebarConversation = new URLSearchParams(window.location.search).has(SIDEBAR_CONVERSATION_ID_PARAM);
      const isChatRoot = pathname === ROUTES_PATH.CHAT && !activeTabId;

      if (isChatRoot && hasSidebarConversation) {
        setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.EXPANDED);

        return;
      }

      if (isTabIdOnlyChange && hasSidebarConversation) return;

      setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.COLLAPSED);
    },
    [pathname, activeTabId, setChatSidebarStateInternal],
  );

  const reconcileSidebarWithRoute = useCallback(() => {
    const hasSidebarConversation = new URLSearchParams(window.location.search).has(SIDEBAR_CONVERSATION_ID_PARAM);
    const isChatRoot = pathname === ROUTES_PATH.CHAT && !activeTabId;

    if (isChatRoot && hasSidebarConversation) {
      if (chatSidebarStateRef.current !== CHAT_SIDEBAR_STATE.EXPANDED) {
        setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.EXPANDED);
      }

      return;
    }

    if (chatSidebarStateRef.current === CHAT_SIDEBAR_STATE.EXPANDED) {
      setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.SIDEBAR);
    }
  }, [pathname, activeTabId, setChatSidebarStateInternal]);

  const handleRouteChange = useCallback(() => {
    if (prevRouteSignatureRef.current === routeSignature) {
      prevPathnameRef.current = pathname;
      prevActiveTabIdRef.current = activeTabId;

      return;
    }

    const prevPathname = prevPathnameRef.current;
    const prevActiveTab = prevActiveTabIdRef.current;

    prevRouteSignatureRef.current = routeSignature;
    prevPathnameRef.current = pathname;
    prevActiveTabIdRef.current = activeTabId;

    const isTabIdOnlyChange = prevPathname === pathname && prevActiveTab !== activeTabId;

    if (pendingCollapseRef.current) {
      handlePendingCollapse(isTabIdOnlyChange);

      return;
    }

    if (isTabIdOnlyChange) return;

    reconcileSidebarWithRoute();
  }, [routeSignature, pathname, activeTabId, handlePendingCollapse, reconcileSidebarWithRoute]);

  useEffect(() => {
    handleRouteChange();
  }, [handleRouteChange]);

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
    setIsFilesPanelHydrated(true);
  }, []);

  const value: PaceContextType = useMemo(
    () => ({
      chatSidebarState,
      prevChatSidebarState,
      setChatSidebarState,
      collapseSidebar,
      scheduleCollapseOnRouteChange,

      registerStartNewChat,
      startNewChat,

      registerSelectConversation,
      selectConversation,

      pendingFileReference,
      setPendingFileReference,
      clearPendingFileReference,

      chatMessageIntent,
      setChatMessageIntent,

      activeAgentInfo,
      setActiveAgentInfo,

      filesPanelOpen,
      filesPanelPinned,
      isFilesPanelHydrated,
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

      selectedModel,
      setSelectedModel,
    }),
    [
      chatSidebarState,
      prevChatSidebarState,
      setChatSidebarState,
      collapseSidebar,
      scheduleCollapseOnRouteChange,

      registerStartNewChat,
      startNewChat,

      registerSelectConversation,
      selectConversation,

      pendingFileReference,
      clearPendingFileReference,

      chatMessageIntent,

      activeAgentInfo,

      filesPanelOpen,
      filesPanelPinned,
      isFilesPanelHydrated,
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

      selectedModel,
      setSelectedModel,
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
