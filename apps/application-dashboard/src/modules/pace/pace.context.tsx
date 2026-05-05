'use client';

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { type MessageReferenceType, type UploadedFile } from '@zamp-platform/chat';
import {
  FILE_TREE_COLUMN_MAX_WIDTH,
  FILE_TREE_COLUMN_MIN_WIDTH,
  FILE_TREE_COLUMN_WIDTH,
  FILES_LISTING_CONVERSATION_ID,
  FILES_PANEL_MAX_WIDTH,
  FILES_PANEL_MIN_WIDTH,
  FILES_PANEL_WIDTH,
  FILES_PANEL_WIDTH_FILES_SURFACE,
  SIDEBAR_CONVERSATION_ID_PARAM,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_WIDTH,
} from 'modules/pace/pace.constants';
import { CHAT_SIDEBAR_STATE, type ChatSidebarState, TAB_TYPE } from 'modules/pace/pace.types';
import { getInitialSidebarState, getInitialWidth } from 'modules/pace/pace.utils';
import { usePathname, useSearchParams } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import { store } from '@/store';
import {
  dynamicTabsActions,
  selectActiveConversationPanelState,
  selectActiveTab,
  selectActiveTabId,
  selectConversationActiveTabId,
} from '@/store/slices/dynamic-tabs.slice';
import { defaultFnType } from '@/types/commonTypes';
import { NAV_SIDEBAR_EXPANDED_COOKIE, setCookie, THEME_COOKIE_MAX_AGE } from '@/utils/cookie';
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

  logoAnimationKey: number;
  triggerLogoAnimation: defaultFnType;

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
  hasActiveTaskTab: boolean;
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

type PaceLayoutContextType = Pick<
  PaceContextType,
  | 'chatSidebarState'
  | 'prevChatSidebarState'
  | 'setChatSidebarState'
  | 'filesPanelOpen'
  | 'isFilesPanelHydrated'
  | 'sidebarWidth'
  | 'setSidebarWidth'
  | 'persistSidebarWidth'
  | 'isSidebarResizing'
  | 'setIsSidebarResizing'
  | 'filesPanelWidth'
  | 'setFilesPanelWidth'
  | 'persistFilesPanelWidth'
  | 'isFilesPanelResizing'
  | 'setIsFilesPanelResizing'
  | 'treeColumnWidth'
  | 'setTreeColumnWidth'
  | 'persistTreeColumnWidth'
  | 'isTreeColumnResizing'
  | 'setIsTreeColumnResizing'
  | 'hasActiveFileTab'
  | 'hasActiveAgentTab'
  | 'hasActiveTaskTab'
  | 'hasActivePanelTab'
  | 'isFilesPanelExpanded'
  | 'toggleFilesPanelExpanded'
  | 'setFilesPanelExpanded'
  | 'isTreeSidebarOpen'
  | 'toggleTreeSidebar'
  | 'setTreeSidebarOpen'
  | 'wordWrapEnabled'
  | 'toggleWordWrap'
  | 'isNavSidebarExpanded'
  | 'toggleNavSidebar'
>;

type PaceConversationContextType = Pick<
  PaceContextType,
  | 'activeConversationId'
  | 'setActiveConversationId'
  | 'pendingFileReferences'
  | 'setPendingFileReferences'
  | 'clearPendingFileReferences'
  | 'pendingMentionInserts'
  | 'setPendingMentionInserts'
  | 'clearPendingMentionInserts'
  | 'sharedFileReferences'
  | 'setSharedFileReferences'
  | 'sharedExternalFilePaths'
  | 'chatMessageIntent'
  | 'setChatMessageIntent'
  | 'activeAgentInfo'
  | 'setActiveAgentInfo'
  | 'selectedModel'
  | 'setSelectedModel'
>;

type PaceActionsContextType = Pick<
  PaceContextType,
  | 'collapseSidebar'
  | 'scheduleCollapseOnRouteChange'
  | 'registerStartNewChat'
  | 'startNewChat'
  | 'logoAnimationKey'
  | 'triggerLogoAnimation'
  | 'registerSelectConversation'
  | 'selectConversation'
>;

const PaceContext = createContext<PaceContextType | null>(null);
const PaceLayoutContext = createContext<PaceLayoutContextType | null>(null);
const PaceConversationContext = createContext<PaceConversationContextType | null>(null);
const PaceActionsContext = createContext<PaceActionsContextType | null>(null);

const getInitialBoolean = (key: LOCAL_STORAGE_KEYS, fallback: boolean): boolean => {
  if (typeof window === 'undefined') return fallback;

  const stored = getFromLocalStorage(key);

  if (stored === null) return fallback;

  return stored === 'true';
};

interface PaceProviderProps {
  children: ReactNode;
  initialNavSidebarExpanded?: boolean;
}

export const PaceProvider = ({ children, initialNavSidebarExpanded = true }: PaceProviderProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const activeTabId = useAppSelector(selectActiveTabId);
  const activeTab = useAppSelector(selectActiveTab);
  const activeConversationPanelState = useAppSelector(selectActiveConversationPanelState);
  const hasActiveFileTab = activeTab?.type === TAB_TYPE.FILE;
  const hasActiveAgentTab = activeTab?.type === TAB_TYPE.AGENT;
  const hasActiveTaskTab = activeTab?.type === TAB_TYPE.TASK;
  const hasActivePanelTab = hasActiveFileTab || hasActiveAgentTab || hasActiveTaskTab;
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
  const [activeConversationId, setActiveConversationIdRaw] = useState<string | null>(null);
  const [logoAnimationKey, setLogoAnimationKey] = useState(0);
  const filesPanelOpen = hasActivePanelTab;
  const [isFilesPanelHydrated, setIsFilesPanelHydrated] = useState(false);
  const [sidebarWidth, setSidebarWidthRaw] = useState(() =>
    getInitialWidth(LOCAL_STORAGE_KEYS.PACE_SIDEBAR_WIDTH, SIDEBAR_MIN_WIDTH, SIDEBAR_MAX_WIDTH, SIDEBAR_WIDTH),
  );
  const [isSidebarResizing, setIsSidebarResizing] = useState(false);
  const [filesPanelWidthChat, setFilesPanelWidthChatRaw] = useState(() =>
    getInitialWidth(
      LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_WIDTH,
      FILES_PANEL_MIN_WIDTH,
      FILES_PANEL_MAX_WIDTH,
      FILES_PANEL_WIDTH,
    ),
  );
  const [filesPanelWidthFilesSurface, setFilesPanelWidthFilesSurfaceRaw] = useState(() =>
    getInitialWidth(
      LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_WIDTH_FILES_SURFACE,
      FILES_PANEL_MIN_WIDTH,
      FILES_PANEL_MAX_WIDTH,
      FILES_PANEL_WIDTH_FILES_SURFACE,
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
  const [isNavSidebarExpanded, setIsNavSidebarExpanded] = useState<boolean>(initialNavSidebarExpanded);
  const [globalFilesPanelExpandedDefault] = useState(() =>
    getInitialBoolean(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_EXPANDED, false),
  );
  const [globalTreeSidebarOpenDefault] = useState(() =>
    getInitialBoolean(LOCAL_STORAGE_KEYS.PACE_TREE_SIDEBAR_OPEN, false),
  );
  const [globalWordWrapDefault] = useState(() => getInitialBoolean(LOCAL_STORAGE_KEYS.PACE_WORD_WRAP_ENABLED, false));
  const isFilesPanelExpanded = activeConversationPanelState.isFilesPanelExpanded ?? globalFilesPanelExpandedDefault;
  const isTreeSidebarOpen = activeConversationPanelState.isTreeSidebarOpen ?? globalTreeSidebarOpenDefault;
  const wordWrapEnabled = activeConversationPanelState.wordWrapEnabled ?? globalWordWrapDefault;

  const isFilesSurface = pathname === ROUTES_PATH.CHAT_FILES;
  const filesPanelWidth = isFilesSurface ? filesPanelWidthFilesSurface : filesPanelWidthChat;

  const routeSignature = activeTabId
    ? `${pathname}:${activeConversationId ?? ''}:${activeTabId}`
    : `${pathname}:${activeConversationId ?? ''}`;
  const prevRouteSignatureRef = useRef(routeSignature);
  const prevPathnameRef = useRef(pathname);
  const prevActiveTabIdRef = useRef(activeTabId);
  const prevActiveConversationIdRef = useRef(activeConversationId);
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

  const setActiveConversationId = useCallback(
    (id: string | null) => {
      setActiveConversationIdRaw(id);
      dispatch(dynamicTabsActions.setActiveConversation(id));
    },
    [dispatch],
  );

  useLayoutEffect(() => {
    const routeConversationId =
      pathname === ROUTES_PATH.CHAT
        ? (searchParams?.get(SIDEBAR_CONVERSATION_ID_PARAM) ?? null)
        : pathname === ROUTES_PATH.CHAT_FILES
          ? FILES_LISTING_CONVERSATION_ID
          : null;

    if (activeConversationId === routeConversationId) return;

    setActiveConversationId(routeConversationId);
  }, [activeConversationId, pathname, searchParams, setActiveConversationId]);

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

  const setFilesPanelWidth = useCallback(
    (width: number) => {
      const clamped = Math.min(FILES_PANEL_MAX_WIDTH, Math.max(FILES_PANEL_MIN_WIDTH, width));

      if (isFilesSurface) {
        setFilesPanelWidthFilesSurfaceRaw(clamped);
      } else {
        setFilesPanelWidthChatRaw(clamped);
      }
    },
    [isFilesSurface],
  );

  const persistFilesPanelWidth = useCallback(
    (width: number) => {
      const clamped = Math.min(FILES_PANEL_MAX_WIDTH, Math.max(FILES_PANEL_MIN_WIDTH, width));

      if (isFilesSurface) {
        setFilesPanelWidthFilesSurfaceRaw(clamped);
        setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_WIDTH_FILES_SURFACE, String(clamped));
      } else {
        setFilesPanelWidthChatRaw(clamped);
        setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_WIDTH, String(clamped));
      }
    },
    [isFilesSurface],
  );

  const setTreeColumnWidth = useCallback((width: number) => {
    const clamped = Math.min(FILE_TREE_COLUMN_MAX_WIDTH, Math.max(FILE_TREE_COLUMN_MIN_WIDTH, width));

    setTreeColumnWidthRaw(clamped);
  }, []);

  const persistTreeColumnWidth = useCallback((width: number) => {
    const clamped = Math.min(FILE_TREE_COLUMN_MAX_WIDTH, Math.max(FILE_TREE_COLUMN_MIN_WIDTH, width));

    setTreeColumnWidthRaw(clamped);
    setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILE_TREE_COLUMN_WIDTH, String(clamped));
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

      setCookie(NAV_SIDEBAR_EXPANDED_COOKIE, String(next), THEME_COOKIE_MAX_AGE);

      return next;
    });
  }, []);

  const setFilesPanelExpanded = useCallback(
    (expanded: boolean) => {
      dispatch(dynamicTabsActions.patchActiveConversationPanelState({ isFilesPanelExpanded: expanded }));
    },
    [dispatch],
  );

  const toggleFilesPanelExpanded = useCallback(() => {
    dispatch(dynamicTabsActions.toggleActiveConversationPanelState('isFilesPanelExpanded'));
  }, [dispatch]);

  const setTreeSidebarOpen = useCallback(
    (open: boolean) => {
      dispatch(dynamicTabsActions.patchActiveConversationPanelState({ isTreeSidebarOpen: open }));
    },
    [dispatch],
  );

  const toggleTreeSidebar = useCallback(() => {
    dispatch(dynamicTabsActions.toggleActiveConversationPanelState('isTreeSidebarOpen'));
  }, [dispatch]);

  const toggleWordWrap = useCallback(() => {
    dispatch(dynamicTabsActions.toggleActiveConversationPanelState('wordWrapEnabled'));
  }, [dispatch]);

  const registerStartNewChat = useCallback((callback: defaultFnType) => {
    startNewChatRef.current = callback;
  }, []);

  const startNewChat = useCallback(() => {
    startNewChatRef.current?.();
  }, []);

  const triggerLogoAnimation = useCallback(() => {
    setLogoAnimationKey((prev) => prev + 1);
  }, []);

  const registerSelectConversation = useCallback((callback: (id: string, title?: string) => void) => {
    selectConversationRef.current = callback;
  }, []);

  const selectConversation = useCallback(
    (id: string, title?: string) => {
      selectConversationRef.current?.(id, title);

      const targetActiveTabId = selectConversationActiveTabId(store.getState(), id);
      const isChatRoot = pathname === ROUTES_PATH.CHAT && !targetActiveTabId;
      const nextState = isChatRoot ? CHAT_SIDEBAR_STATE.EXPANDED : CHAT_SIDEBAR_STATE.SIDEBAR;

      if (chatSidebarStateRef.current !== nextState) {
        setChatSidebarStateInternal(nextState);
      }
    },
    [pathname, setChatSidebarStateInternal],
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
      const isOnChatSurface = pathname === ROUTES_PATH.CHAT;

      if (!isOnChatSurface) {
        if (chatSidebarStateRef.current !== CHAT_SIDEBAR_STATE.COLLAPSED) {
          setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.COLLAPSED);
        }

        return;
      }

      if (isChatRoot && hasSidebarConversation) {
        if (chatSidebarStateRef.current !== CHAT_SIDEBAR_STATE.EXPANDED) {
          setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.EXPANDED);
        }

        return;
      }

      if (isTabIdHydration) return;

      if (activeTabId && hasSidebarConversation) {
        if (chatSidebarStateRef.current !== CHAT_SIDEBAR_STATE.SIDEBAR) {
          setChatSidebarStateInternal(CHAT_SIDEBAR_STATE.SIDEBAR);
        }
      }
    },
    [pathname, activeTabId, setChatSidebarStateInternal],
  );

  const handleRouteChange = useCallback(() => {
    if (prevRouteSignatureRef.current === routeSignature) {
      prevPathnameRef.current = pathname;
      prevActiveTabIdRef.current = activeTabId;
      prevActiveConversationIdRef.current = activeConversationId;

      return;
    }

    const prevPathname = prevPathnameRef.current;
    const prevActiveTab = prevActiveTabIdRef.current;
    const prevActiveConversationId = prevActiveConversationIdRef.current;

    prevRouteSignatureRef.current = routeSignature;
    prevPathnameRef.current = pathname;
    prevActiveTabIdRef.current = activeTabId;
    prevActiveConversationIdRef.current = activeConversationId;

    const isTabIdOnlyChange =
      prevPathname === pathname && prevActiveConversationId === activeConversationId && prevActiveTab !== activeTabId;
    const isTabIdHydration = isTabIdOnlyChange && prevActiveTab === null && activeTabId !== null;

    if (pendingCollapseRef.current) {
      handlePendingCollapse(isTabIdOnlyChange);

      return;
    }

    reconcileSidebarWithRoute(isTabIdHydration);
  }, [routeSignature, pathname, activeTabId, activeConversationId, handlePendingCollapse, reconcileSidebarWithRoute]);

  useEffect(() => {
    handleRouteChange();
  }, [handleRouteChange]);

  useEffect(() => {
    if (!filesPanelOpen) return;
    if (chatSidebarStateRef.current !== CHAT_SIDEBAR_STATE.SIDEBAR) return;
    if (hasActivePanelTab) return;

    const containerWidth = window.innerWidth - 16;
    const sidebarSpace = sidebarWidth + 8;
    const available = containerWidth - 8 - 100 - sidebarSpace;
    const effectiveMax = Math.min(FILES_PANEL_MAX_WIDTH, Math.max(FILES_PANEL_MIN_WIDTH, available));

    if (filesPanelWidth > effectiveMax) {
      setFilesPanelWidthChatRaw(effectiveMax);
      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_FILES_PANEL_WIDTH, String(effectiveMax));
    }
  }, [filesPanelOpen, filesPanelWidth, sidebarWidth, hasActivePanelTab]);

  useEffect(() => {
    clampSidebarWidthToFilesPanel();
  }, [clampSidebarWidthToFilesPanel]);

  useEffect(() => {
    setIsFilesPanelHydrated(true);
  }, []);

  useEffect(() => {
    if (filesPanelOpen) return;
    if (!isFilesPanelExpanded) return;
    setFilesPanelExpanded(false);
  }, [filesPanelOpen, isFilesPanelExpanded, setFilesPanelExpanded]);

  useEffect(() => {
    if (hasActivePanelTab) return;

    setSidebarWidthRaw((prev) => {
      if (prev <= SIDEBAR_MAX_WIDTH) return prev;

      setToLocalStorage(LOCAL_STORAGE_KEYS.PACE_SIDEBAR_WIDTH, String(SIDEBAR_MAX_WIDTH));

      return SIDEBAR_MAX_WIDTH;
    });
  }, [hasActivePanelTab]);

  const layoutValue: PaceLayoutContextType = useMemo(
    () => ({
      chatSidebarState,
      prevChatSidebarState,
      setChatSidebarState,

      filesPanelOpen,
      isFilesPanelHydrated,

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
      hasActiveTaskTab,
      hasActivePanelTab,

      isFilesPanelExpanded,
      toggleFilesPanelExpanded,
      setFilesPanelExpanded,

      isTreeSidebarOpen,
      toggleTreeSidebar,
      setTreeSidebarOpen,

      wordWrapEnabled,
      toggleWordWrap,

      isNavSidebarExpanded,
      toggleNavSidebar,
    }),
    [
      chatSidebarState,
      prevChatSidebarState,
      setChatSidebarState,

      filesPanelOpen,
      isFilesPanelHydrated,

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
      hasActiveTaskTab,
      hasActivePanelTab,

      isFilesPanelExpanded,
      toggleFilesPanelExpanded,
      setFilesPanelExpanded,

      isTreeSidebarOpen,
      toggleTreeSidebar,
      setTreeSidebarOpen,

      wordWrapEnabled,
      toggleWordWrap,

      isNavSidebarExpanded,
      toggleNavSidebar,
    ],
  );

  const conversationValue: PaceConversationContextType = useMemo(
    () => ({
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

      selectedModel,
      setSelectedModel,
    }),
    [
      activeConversationId,
      setActiveConversationId,

      pendingFileReferences,
      clearPendingFileReferences,

      pendingMentionInserts,
      clearPendingMentionInserts,

      sharedFileReferences,

      chatMessageIntent,

      activeAgentInfo,

      selectedModel,
      setSelectedModel,
    ],
  );

  const actionsValue: PaceActionsContextType = useMemo(
    () => ({
      collapseSidebar,
      scheduleCollapseOnRouteChange,

      registerStartNewChat,
      startNewChat,

      logoAnimationKey,
      triggerLogoAnimation,

      registerSelectConversation,
      selectConversation,
    }),
    [
      collapseSidebar,
      scheduleCollapseOnRouteChange,

      registerStartNewChat,
      startNewChat,

      logoAnimationKey,
      triggerLogoAnimation,

      registerSelectConversation,
      selectConversation,
    ],
  );

  const value: PaceContextType = useMemo(
    () => ({
      chatSidebarState,
      prevChatSidebarState,
      setChatSidebarState,
      collapseSidebar,
      scheduleCollapseOnRouteChange,

      registerStartNewChat,
      startNewChat,

      logoAnimationKey,
      triggerLogoAnimation,

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
      hasActiveTaskTab,
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

      logoAnimationKey,
      triggerLogoAnimation,

      registerSelectConversation,
      selectConversation,

      activeConversationId,
      setActiveConversationId,

      pendingFileReferences,
      clearPendingFileReferences,

      pendingMentionInserts,
      clearPendingMentionInserts,

      sharedFileReferences,

      chatMessageIntent,

      activeAgentInfo,

      filesPanelOpen,
      isFilesPanelHydrated,

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
      hasActiveTaskTab,
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

  return (
    <PaceActionsContext.Provider value={actionsValue}>
      <PaceConversationContext.Provider value={conversationValue}>
        <PaceLayoutContext.Provider value={layoutValue}>
          <PaceContext.Provider value={value}>{children}</PaceContext.Provider>
        </PaceLayoutContext.Provider>
      </PaceConversationContext.Provider>
    </PaceActionsContext.Provider>
  );
};

export const usePaceContext = () => {
  const context = useContext(PaceContext);

  if (!context) {
    throw new Error('usePaceContext must be used within a PaceProvider');
  }

  return context;
};

export const usePaceLayoutContext = () => {
  const context = useContext(PaceLayoutContext);

  if (!context) {
    throw new Error('usePaceLayoutContext must be used within a PaceProvider');
  }

  return context;
};

export const usePaceConversationContext = () => {
  const context = useContext(PaceConversationContext);

  if (!context) {
    throw new Error('usePaceConversationContext must be used within a PaceProvider');
  }

  return context;
};

export const usePaceActionsContext = () => {
  const context = useContext(PaceActionsContext);

  if (!context) {
    throw new Error('usePaceActionsContext must be used within a PaceProvider');
  }

  return context;
};

export default PaceContext;
