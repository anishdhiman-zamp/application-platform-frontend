'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SIDEBAR_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { CHAT_SIDEBAR_STATE, TAB_QUERY_PARAM } from 'modules/pace/pace.types';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { usePaceConversationContext, usePaceLayoutContext } from '@/modules/pace/pace.context';
import { store } from '@/store';

interface UseChatSidebarStateProps {
  initialConversationId: string | null;
}

export const useChatSidebarState = ({ initialConversationId }: UseChatSidebarStateProps) => {
  const { chatSidebarState, setChatSidebarState } = usePaceLayoutContext();
  const { setActiveAgentInfo, setActiveConversationId } = usePaceConversationContext();

  const prevInitialConversationIdRef = useRef(initialConversationId);
  const internalUpdateRef = useRef(false);

  const [chatTitle, setChatTitle] = useState('');
  const [conversationId, setConversationIdState] = useState<string | null>(initialConversationId);
  const [chatKey, setChatKey] = useState(0);

  const hasTabParam = useCallback((params: URLSearchParams) => {
    return Object.values(TAB_QUERY_PARAM).some((param) => params.has(param));
  }, []);

  const getConversationUrl = useCallback(
    (id: string | null, restoreExistingPanel: boolean) => {
      const currentParams = new URLSearchParams(window.location.search);
      const shouldKeepCurrentTabRoute = restoreExistingPanel && hasTabParam(currentParams);

      const newBucket = id && !shouldKeepCurrentTabRoute ? store.getState().dynamicTabs.byConversation[id] : null;
      const newActiveTabId = newBucket?.activeTabId ?? null;
      const newActiveTab = newActiveTabId ? newBucket?.tabs.find((t) => t.id === newActiveTabId) : null;
      const targetPath = shouldKeepCurrentTabRoute
        ? `${window.location.pathname}${window.location.search}`
        : (newActiveTab?.path ?? ROUTES_PATH.CHAT);

      const url = new URL(targetPath, window.location.origin);

      Object.values(TAB_QUERY_PARAM).forEach((param) => {
        if (!shouldKeepCurrentTabRoute && !newActiveTab) url.searchParams.delete(param);
      });

      if (id) {
        url.searchParams.set(SIDEBAR_CONVERSATION_ID_PARAM, id);
      } else {
        url.searchParams.delete(SIDEBAR_CONVERSATION_ID_PARAM);
      }

      return `${url.pathname}${url.search}`;
    },
    [hasTabParam],
  );

  const handleConversationIdUpdate = useCallback(() => {
    const params = new URLSearchParams(window.location.search);

    params.delete(SIDEBAR_CONVERSATION_ID_PARAM);
    Object.values(TAB_QUERY_PARAM).forEach((param) => params.delete(param));

    const currentPath = window.location.pathname;
    const newUrl = params.toString() ? `${currentPath}?${params.toString()}` : currentPath;

    window.history.replaceState(null, '', newUrl);
  }, []);

  const setConversationId = useCallback(
    (id: string | null, title?: string) => {
      internalUpdateRef.current = true;
      setConversationIdState(id);
      setActiveConversationId(id);
      setChatTitle(title || '');
      window.history.replaceState(null, '', getConversationUrl(id, false));
    },
    [getConversationUrl, setActiveConversationId],
  );

  const startNewChat = useCallback(() => {
    internalUpdateRef.current = true;
    setChatTitle('');
    setConversationIdState(null);
    setActiveConversationId(null);
    setChatKey((prev) => prev + 1);
    handleConversationIdUpdate();
    setChatSidebarState(CHAT_SIDEBAR_STATE.COLLAPSED);
  }, [handleConversationIdUpdate, setActiveConversationId, setChatSidebarState]);

  useEffect(() => {
    if (prevInitialConversationIdRef.current !== initialConversationId) {
      const wasNull = prevInitialConversationIdRef.current === null;
      const wasInternal = internalUpdateRef.current;

      internalUpdateRef.current = false;

      prevInitialConversationIdRef.current = initialConversationId;

      if (wasInternal) {
        return;
      }

      setConversationIdState(initialConversationId);
      setActiveConversationId(initialConversationId);
      setActiveAgentInfo(null);

      if (initialConversationId) {
        window.history.replaceState(null, '', getConversationUrl(initialConversationId, true));
        if (wasNull) {
          setChatKey((prev) => prev + 1);
        }
        if (chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED) {
          setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
        }
      } else {
        setChatTitle('');
        setChatKey((prev) => prev + 1);
      }
    }
  }, [
    initialConversationId,
    chatSidebarState,
    setChatSidebarState,
    setActiveAgentInfo,
    setActiveConversationId,
    getConversationUrl,
  ]);

  return {
    chatTitle,
    setChatTitle,
    conversationId,
    setConversationId,
    chatKey,
    startNewChat,
  };
};
