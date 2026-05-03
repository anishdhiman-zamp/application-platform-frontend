'use client';

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type MessageReferenceType, type UploadedFile } from '@zamp-platform/chat';
import {
  FILE_TREE_COLUMN_MAX_WIDTH,
  FILE_TREE_COLUMN_MIN_WIDTH,
  FILE_TREE_COLUMN_WIDTH,
  FILES_PANEL_MAX_WIDTH,
  FILES_PANEL_MIN_WIDTH,
  FILES_PANEL_WIDTH,
  SIDEBAR_CONVERSATION_ID_PARAM,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_WIDTH,
} from 'modules/pace/pace.constants';
import { CHAT_SIDEBAR_STATE, type ChatSidebarState, TAB_TYPE } from 'modules/pace/pace.types';
import { getInitialSidebarState, getInitialWidth } from 'modules/pace/pace.utils';
import { usePathname } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { dynamicTabsActions, selectActiveTab, selectActiveTabId } from '@/store/slices/dynamic-tabs.slice';
import { defaultFnType } from '@/types/commonTypes';
import { getFromLocalStorage, LOCAL_STORAGE_KEYS, setToLocalStorage } from '@/utils/localstorage';

export interface PendingFileReference {
  path: string;
  name: string;
}

export interface PendingMentionInsert {
  path: string;
  name: string;
  iconHint?: string;
}

export interface ChatMessageIntent {
  message: string;
  fileReferences?: { path: string; name: string }[];
  references?: MessageReferenceType[];
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

  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;

  pendingFileReferences: PendingFileReference[];
  setPendingFileReferences: (refs: PendingFileReference[]) => void;
  clearPendingFileReferences: defaultFnType;

  pendingMentionInserts: PendingMentionInsert[];
  setPendingMentionInserts: (inserts: PendingMentionInsert[]) => void;
  clearPendingMentionInserts: defaultFnType;

  sharedFileReferences: UploadedFile[];
  setSharedFileReferences: Dispatch<SetStateAction<UploadedFile[]>>;
  sharedExternalFilePaths: React.RefObject<Set<string>>;

  chatMessageIntent: ChatMessageIntent | null;
  setChatMessageIntent: (payload: ChatMessageIntent | null) => void;

  activeAgentInfo: ActiveAgentInfo | null;
  setActiveAgentInfo: (info: ActiveAgentInfo | null) => void;

  filesPanelOpen: boolean;
  isFilesPanelHydrated: boolean;
  toggleFilesPanel: defaultFnType;
  closeFilesPanel: defaultFnType;
  openFilesPanel: defaultFnType;

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

  treeColumnWidth: number;
  setTreeColumnWidth: (width: number) => void;
  persistTreeColumnWidth: (width: number) => void;
  isTreeColumnResizing: boolean;
  setIsTreeColumnResizing: (resizing: boolean) => void;

  hasActiveFileTab: boolean;
  hasActiveAgentTab: boolean;
  hasActivePanelTab: boolean;

  isFilesPanelExpanded: boolean;
  toggleFilesPanelExpanded: defaultFnType;
  setFilesPanelExpanded: (expanded: boolean) => void;

  isTreeSidebarOpen: boolean;
  toggleTreeSidebar: defaultFnType;
  setTreeSidebarOpen: (open: boolean) => void;

  wordWrapEnabled: boolean;
  toggleWordWrap: defaultFnType;

  selectedModel: string | null;
  setSelectedModel: (modelId: string | null) => void;

  isNavSidebarExpanded: boolean;
  toggleNavSidebar: defaultFnType;
}

const PaceContext = createContext<PaceContextType | null>(null);

const getInitialFilesPanelOpen = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_PINNED);

    return stored ? (JSON.parse(stored) as boolean) : false;
  } catch {
    return false;
  }
};

const getInitialBoolean = (key: LOCAL_STORAGE_KEYS, fallback: boolean): boolean => {
  if (typeof window === 'undefined') return fallback;

  const stored = getFromLocalStorage(key);

  if (stored === null) return fallback;

  return stored === 'true';
};

export const PaceProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const activeTabId = useAppSelector(selectActiveTabId);
  const activeTab = useAppSelector(selectActiveTab);
  const hasActiveFileTab = activeTab?.type === TAB_TYPE.FILE;
  const hasActiveAgentTab = activeTab?.type === TAB_TYPE.AGENT;
  const hasActivePanelTab = hasActiveFileTab || hasActiveAgentTab;
  const pendingCollapseRef = useRef(false);
  const startNewChatRef = useRef<defaultFnType | null>(null);
  const selectConversationRef = useRef<((id: string, title?: string) => void) | null>(null);
  const sharedExternalFilePaths = useRef<Set<string>>(new Set());

  const [chatSidebarState, setChatSidebarStateRaw] = useState<ChatSidebarState>(getInitialSidebarState);
  const [prevChatSidebarState, setPrevChatSidebarState] = useState<ChatSidebarState>(chatSidebarState);
  const [pendingFileReferences, setPendingFileReferences] = useState<PendingFileReference[]>([]);
  const [pendingMentionInserts, setPendingMentionInserts] = useState<PendingMentionInsert[]>([]);
  const [sharedFileReferences, setSharedFileReferences] = useState<UploadedFile[]>([]);
  const [chatMessageIntent, setChatMessageIntent] = useState<ChatMessageIntent | null>(null);
  const [activeAgentInfo, setActiveAgentInfo] = useState<ActiveAgentInfo | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [filesPanelOpen, setFilesPanelOpen] = useState(getInitialFilesPanelOpen);
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
  const [treeColumnWidth, setTreeColumnWidthRaw] = useState(() =>
    getInitialWidth(
      LOCAL_STORAGE_KEYS.PACE_FILE_TREE_COLUMN_WIDTH,
      FILE_TREE_COLUMN_MIN_WIDTH,
      FILE_TREE_COLUMN_MAX_WIDTH,
      FILE_TREE_COLUMN_WIDTH,
    ),
  );
  const [isTreeColumnResizing, setIsTreeColumnResizing] = useState(false);
  const [selectedModel, setSelectedModelRaw] = useState<string | null>(
    getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_SELECTED_MODEL),
  );
  const [isNavSidebarExpanded, setIsNavSidebarExpanded] = useState<boolean>(() => {
    const stored = getFromLocalStorage(LOCAL_STORAGE_KEYS.PACE_NAV_SIDEBAR_EXPANDED);

    return stored === null ? true : stored === 'true';
  });
  const [isFilesPanelExpanded, setIsFilesPanelExpanded] = useState<boolean>(() =>
    getInitialBoolean(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_EXPANDED, false),
  );
  const [isTreeSidebarOpen, setIsTreeSidebarOpen] = useState<boolean>(() =>
    getInitialBoolean(LOCAL_STORAGE_KEYS.PACE_TREE_SIDEBAR_OPEN, true),
  );
  const [wordWrapEnabled, setWordWrapEnabled] = useState<boolean>(() =>
    getInitialBoolean(LOCAL_STORAGE_KEYS.PACE_WORD_WRAP_ENABLED, false),
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

  const clearPendingFileReferences = useCallback(() => {
    setPendingFileReferences([]);
  }, []);

  const clearPendingMentionInserts = useCallback(() => {
    setPendingMentionInserts([]);
  }, []);

  const setSidebarWidth = useCallback(
    (width: number) => {
      const max = hasActivePanelTab ? Number.POSITIVE_INFINITY : SIDEBAR_MAX_WIDTH;
      const clamped = Math.min(max, Math.max(SIDEBAR_MIN_WIDTH, width));

      setSidebarWidthRaw(clamped);
    },
    [hasActivePanelTab],
  );

  const persistSidebarWidth = useCallback(
    (width: number) => {
      const max = hasActivePanelTab ? Number.POSITIVE_INFINITY : SIDEBAR_MAX_WIDTH;
      const clamped = Math.min(max, Math.max(SIDEBAR_MIN_WIDTH, width));

      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_SIDEBAR_WIDTH, String(clamped));
    },
    [hasActivePanelTab],
  );

  const setFilesPanelWidth = useCallback((width: number) => {
    const clamped = Math.min(FILES_PANEL_MAX_WIDTH, Math.max(FILES_PANEL_MIN_WIDTH, width));

    setFilesPanelWidthRaw(clamped);
  }, []);

  const persistFilesPanelWidth = useCallback((width: number) => {
    const clamped = Math.min(FILES_PANEL_MAX_WIDTH, Math.max(FILES_PANEL_MIN_WIDTH, width));

    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_WIDTH, String(clamped));
  }, []);

  const setTreeColumnWidth = useCallback((width: number) => {
    const clamped = Math.min(FILE_TREE_COLUMN_MAX_WIDTH, Math.max(FILE_TREE_COLUMN_MIN_WIDTH, width));

    setTreeColumnWidthRaw(clamped);
  }, []);

  const persistTreeColumnWidth = useCallback((width: number) => {
    const clamped = Math.min(FILE_TREE_COLUMN_MAX_WIDTH, Math.max(FILE_TREE_COLUMN_MIN_WIDTH, width));

    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILE_TREE_COLUMN_WIDTH, String(clamped));
  }, []);

  const toggleFilesPanel = useCallback(() => {
    setFilesPanelOpen((prev) => {
      const next = !prev;

      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_PINNED, JSON.stringify(next));

      return next;
    });
  }, []);

  const closeFilesPanel = useCallback(() => {
    setFilesPanelOpen(false);
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_PINNED, JSON.stringify(false));
  }, []);

  const openFilesPanel = useCallback(() => {
    setFilesPanelOpen(true);
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_PINNED, JSON.stringify(true));
  }, []);

  const setSelectedModel = useCallback((modelId: string | null) => {
    setSelectedModelRaw(modelId);

    if (modelId) {
      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_SELECTED_MODEL, modelId);
    }
  }, []);

  const toggleNavSidebar = useCallback(() => {
    setIsNavSidebarExpanded((prev) => {
      const next = !prev;

      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_NAV_SIDEBAR_EXPANDED, String(next));

      return next;
    });
  }, []);

  const setFilesPanelExpanded = useCallback((expanded: boolean) => {
    setIsFilesPanelExpanded(expanded);
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_EXPANDED, String(expanded));
  }, []);

  const toggleFilesPanelExpanded = useCallback(() => {
    setIsFilesPanelExpanded((prev) => {
      const next = !prev;

      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_EXPANDED, String(next));

      return next;
    });
  }, []);

  const setTreeSidebarOpen = useCallback((open: boolean) => {
    setIsTreeSidebarOpen(open);
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_TREE_SIDEBAR_OPEN, String(open));
  }, []);

  const toggleTreeSidebar = useCallback(() => {
    setIsTreeSidebarOpen((prev) => {
      const next = !prev;

      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_TREE_SIDEBAR_OPEN, String(next));

      return next;
    });
  }, []);

  const toggleWordWrap = useCallback(() => {
    setWordWrapEnabled((prev) => {
      const next = !prev;

      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_WORD_WRAP_ENABLED, String(next));

      return next;
    });
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

  const selectConversation = useCallback(
    (id: string, title?: string) => {
      selectConversationRef.current?.(id, title);

      const isChatRoot = pathname === ROUTES_PATH.CHAT && !activeTabId;
      const nextState = isChatRoot ? CHAT_SIDEBAR_STATE.EXPANDED : CHAT_SIDEBAR_STATE.SIDEBAR;

      if (chatSidebarStateRef.current !== nextState) {
        setChatSidebarStateInternal(nextState);
      }
    },
    [pathname, activeTabId, setChatSidebarStateInternal],
  );

  const clampSidebarWidthToFilesPanel = useCallback(() => {
    if (!filesPanelOpen) return;
    if (chatSidebarStateRef.current !== CHAT_SIDEBAR_STATE.SIDEBAR) return;
    if (hasActivePanelTab) return;

    const containerWidth = window.innerWidth - 16;
    const filesPanelSpace = filesPanelWidth + 8;
    const available = containerWidth - 8 - 100 - filesPanelSpace;
    const effectiveMax = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, available));

    setSidebarWidthRaw((prev) => {
      if (prev <= effectiveMax) return prev;

      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_SIDEBAR_WIDTH, String(effectiveMax));

      return effectiveMax;
    });
  }, [filesPanelOpen, filesPanelWidth, hasActivePanelTab]);

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

  const reconcileSidebarWithRoute = useCallback(
    (isTabIdHydration: boolean) => {
      const hasSidebarConversation = new URLSearchParams(window.location.search).has(SIDEBAR_CONVERSATION_ID_PARAM);
      const isChatRoot = pathname === ROUTES_PATH.CHAT && !activeTabId;

      if (isChatRoot && hasSidebarConversation) {
        if (chatSidebarStateRef.current !== CHAT_SIDEBAR_STATE.EXPANDED) {
          setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.EXPANDED);
        }

        return;
      }

      if (isTabIdHydration) return;

      if (chatSidebarStateRef.current === CHAT_SIDEBAR_STATE.EXPANDED) {
        setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.SIDEBAR);
      }
    },
    [pathname, activeTabId, setChatSidebarStateInternal],
  );

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
    const isTabIdHydration = isTabIdOnlyChange && prevActiveTab === null && activeTabId !== null;

    if (pendingCollapseRef.current) {
      handlePendingCollapse(isTabIdOnlyChange);

      return;
    }

    reconcileSidebarWithRoute(isTabIdHydration);
  }, [routeSignature, pathname, activeTabId, handlePendingCollapse, reconcileSidebarWithRoute]);

  useEffect(() => {
    handleRouteChange();
  }, [handleRouteChange]);

  useEffect(() => {
    dispatch(dynamicTabsActions.setActiveConversation(activeConversationId));
  }, [activeConversationId, dispatch]);

  useEffect(() => {
    if (!filesPanelOpen) return;
    if (chatSidebarStateRef.current !== CHAT_SIDEBAR_STATE.SIDEBAR) return;
    if (hasActivePanelTab) return;

    const containerWidth = window.innerWidth - 16;
    const sidebarSpace = sidebarWidth + 8;
    const available = containerWidth - 8 - 100 - sidebarSpace;
    const effectiveMax = Math.min(FILES_PANEL_MAX_WIDTH, Math.max(FILES_PANEL_MIN_WIDTH, available));

    setFilesPanelWidthRaw((prev) => {
      if (prev <= effectiveMax) return prev;

      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_WIDTH, String(effectiveMax));

      return effectiveMax;
    });
  }, [filesPanelOpen, sidebarWidth, hasActivePanelTab]);

  useEffect(() => {
    clampSidebarWidthToFilesPanel();
  }, [clampSidebarWidthToFilesPanel]);

  useEffect(() => {
    setIsFilesPanelHydrated(true);
  }, []);

  useEffect(() => {
    setFilesPanelOpen(hasActivePanelTab);
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_PINNED, JSON.stringify(hasActivePanelTab));
  }, [hasActivePanelTab]);

  useEffect(() => {
    if (filesPanelOpen) return;
    if (!isFilesPanelExpanded) return;
    setIsFilesPanelExpanded(false);
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_EXPANDED, 'false');
  }, [filesPanelOpen, isFilesPanelExpanded]);

  useEffect(() => {
    if (hasActivePanelTab) return;

    setSidebarWidthRaw((prev) => {
      if (prev <= SIDEBAR_MAX_WIDTH) return prev;

      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_SIDEBAR_WIDTH, String(SIDEBAR_MAX_WIDTH));

      return SIDEBAR_MAX_WIDTH;
    });
  }, [hasActivePanelTab]);

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

      activeConversationId,
      setActiveConversationId,

      pendingFileReferences,
      setPendingFileReferences,
      clearPendingFileReferences,

      pendingMentionInserts,
      setPendingMentionInserts,
      clearPendingMentionInserts,

      sharedFileReferences,
      setSharedFileReferences,
      sharedExternalFilePaths,

      chatMessageIntent,
      setChatMessageIntent,

      activeAgentInfo,
      setActiveAgentInfo,

      filesPanelOpen,
      isFilesPanelHydrated,
      toggleFilesPanel,
      closeFilesPanel,
      openFilesPanel,

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

      treeColumnWidth,
      setTreeColumnWidth,
      persistTreeColumnWidth,
      isTreeColumnResizing,
      setIsTreeColumnResizing,

      hasActiveFileTab,
      hasActiveAgentTab,
      hasActivePanelTab,

      isFilesPanelExpanded,
      toggleFilesPanelExpanded,
      setFilesPanelExpanded,

      isTreeSidebarOpen,
      toggleTreeSidebar,
      setTreeSidebarOpen,

      wordWrapEnabled,
      toggleWordWrap,

      selectedModel,
      setSelectedModel,

      isNavSidebarExpanded,
      toggleNavSidebar,
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

      activeConversationId,

      pendingFileReferences,
      clearPendingFileReferences,

      pendingMentionInserts,
      clearPendingMentionInserts,

      sharedFileReferences,

      chatMessageIntent,

      activeAgentInfo,

      filesPanelOpen,
      isFilesPanelHydrated,
      toggleFilesPanel,
      closeFilesPanel,
      openFilesPanel,

      sidebarWidth,
      setSidebarWidth,
      persistSidebarWidth,
      isSidebarResizing,

      filesPanelWidth,
      setFilesPanelWidth,
      persistFilesPanelWidth,
      isFilesPanelResizing,

      treeColumnWidth,
      setTreeColumnWidth,
      persistTreeColumnWidth,
      isTreeColumnResizing,

      hasActiveFileTab,
      hasActiveAgentTab,
      hasActivePanelTab,

      isFilesPanelExpanded,
      toggleFilesPanelExpanded,
      setFilesPanelExpanded,

      isTreeSidebarOpen,
      toggleTreeSidebar,
      setTreeSidebarOpen,

      wordWrapEnabled,
      toggleWordWrap,

      selectedModel,
      setSelectedModel,

      isNavSidebarExpanded,
      toggleNavSidebar,
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
