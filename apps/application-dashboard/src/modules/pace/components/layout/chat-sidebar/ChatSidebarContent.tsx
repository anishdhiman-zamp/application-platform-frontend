'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChatActionsProvider,
  DropOverlay,
  HITLEntityType,
  HITLQuestionsBlock,
  QueuedMessages,
  ResourceType,
  ScopeType,
  useFileDragDrop,
} from '@zamp-platform/chat';
import {
  ConnectedChatInput,
  type MentionInsertPayload,
  useConversationActions,
  useConversationInputState,
  useConversationMessagesState,
  useConversationStatusState,
} from '@zamp-platform/conversation-stream';
import { type ScrollContainerRef } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import ChatConversationContent from 'modules/pace/components/layout/chat-sidebar/ChatConversationContent';
import { usePathname } from 'next/navigation';
import { useEventBus } from '@/app/_providers/sse-provider';
import { getChatTaskRoute } from '@/constants/routeConfig';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import ChatHome from '@/modules/pace/components/chat/ChatHome';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import ModelSelector from '@/modules/pace/components/chat/ModelSelector';
import { shouldUseSingleViewerMode } from '@/modules/pace/components/files-panel/files-panel.utils';
import { HITL_RESPONDED_EVENT } from '@/modules/pace/components/tasks/constants/tasks.constants';
import { useChatDraftInput } from '@/modules/pace/hooks/useChatDraftInput';
import { useHitlQuestions } from '@/modules/pace/hooks/useHitlQuestions';
import { useReferencePicker } from '@/modules/pace/hooks/useReferencePicker';
import {
  BrowserViewerDisplayState,
  NEW_CONVERSATION_ID,
  SINGLE_VIEWER_TAB_METADATA_KEY,
} from '@/modules/pace/pace.constants';
import { usePaceConversationContext, usePaceLayoutContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';
import { preserveSidebarParam } from '@/modules/pace/pace.utils';
import {
  CONVERSATION_ACCESS_PRIVILEGES,
  ResourceType as ShareResourceType,
  ShareResourceVersion,
} from '@/modules/shareResource/shareResource.types';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

// In-memory per-conversation scroll position cache (browser session only).
// Keyed by conversationId, with NEW_CONVERSATION_ID as the homepage bucket.
const conversationScrollCache = new Map<string, number>();

export interface ChatSidebarContentProps {
  conversationId: string | null;
  setConversationId: (id: string | null, title?: string) => void;
  setChatTitle: (title: string) => void;
  startNewChat: () => void;
  chatTitle: string;
  chatKey: number;
  organizationId: string;
  currentUserName: string;
  username: string;
}

const ChatSidebarContent = ({
  conversationId,
  setChatTitle,
  startNewChat,
  chatTitle,
  organizationId,
  currentUserName,
  username,
}: ChatSidebarContentProps) => {
  const pathname = usePathname();
  const { activeTab } = useDynamicTabs();
  const { openTab, openSingleTab: openSingleFileTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const { openTab: openDatasetTab, openSingleTab: openSingleDatasetTab } = useDynamicTabs({ type: TAB_TYPE.DATASET });
  const { openTab: openTaskTab, openSingleTab: openSingleTaskTab } = useDynamicTabs({ type: TAB_TYPE.TASK });
  const {
    openTab: openBrowserTab,
    openSingleTab: openSingleBrowserTab,
    updateTab: updateBrowserTab,
  } = useDynamicTabs({ type: TAB_TYPE.BROWSER });
  const { chatSidebarState, setChatSidebarState } = usePaceLayoutContext();
  const {
    activeAgentInfo,
    activeFileInfo,
    selectedModel,
    setSelectedModel,
    sharedFileReferences,
    setSharedFileReferences,
    sharedExternalFilePaths,
  } = usePaceConversationContext();
  const { inputValue, setInputValue } = useChatDraftInput({
    conversationId,
  });
  const { inputsRequired, initiatedBy } = useConversationInputState();
  const { queuedMessages } = useConversationMessagesState();
  const { isLoadingConversationHistory, isFetchingConversationHistory } = useConversationStatusState();
  const { refetchConversationHistory } = useConversationActions();
  const { sseEventBus } = useEventBus();

  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);
  const addFileReferenceRef = useRef<((ref: { path: string; name: string }) => void) | null>(null);
  const addMentionRef = useRef<((payload: MentionInsertPayload) => void) | null>(null);
  const scrollContainerRef = useRef<ScrollContainerRef | null>(null);
  const hitlWrapperRef = useRef<HTMLDivElement>(null);
  const hitlHeightRef = useRef(0);
  const restoredScrollKeyRef = useRef<string | null>(null);

  const scrollCacheKey = conversationId ?? NEW_CONVERSATION_ID;

  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false);
  const [isConversationNotFound, setIsConversationNotFound] = useState(false);

  const { hitlQuestions, hitlQuestionsKey } = useHitlQuestions(inputsRequired);
  const hasInputsRequired = (inputsRequired?.length ?? 0) > 0;
  const referencePicker = useReferencePicker();

  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ShareResourceType.CONVERSATION,
    resourceId: conversationId ?? '',
    skipAudienceData: false,
    version: ShareResourceVersion.V2,
  });
  const isViewer =
    Boolean(conversationId) &&
    checkUserPrivilege(CONVERSATION_ACCESS_PRIVILEGES.VIEWER) &&
    !checkUserPrivilege(PERMISSION_ROLES.ADMIN);
  const shouldShowScopedHome =
    !conversationId &&
    (activeTab?.type === TAB_TYPE.AGENT || (activeTab?.type === TAB_TYPE.FILE && Boolean(activeFileInfo)));

  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: isViewer,
  });

  useEffect(() => {
    const el = hitlWrapperRef.current;

    hitlHeightRef.current = 0;

    if (!el) return;

    const observer = new ResizeObserver(() => {
      const newHeight = el.offsetHeight;

      if (newHeight > hitlHeightRef.current) {
        scrollContainerRef.current?.scrollToBottom('smooth');
      }
      hitlHeightRef.current = newHeight;
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [hasInputsRequired]);

  const modelSelectorSlot = useMemo(
    () => <ModelSelector value={selectedModel} onChange={setSelectedModel} />,
    [selectedModel],
  );

  const collapseSidebarIfExpanded = useCallback(() => {
    if (chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED) {
      setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
    }
  }, [chatSidebarState, setChatSidebarState]);

  const handleFileOpen = useCallback(
    (path: string, name: string) => {
      collapseSidebarIfExpanded();

      if (shouldUseSingleViewerMode(pathname, activeTab)) {
        openSingleFileTab(path, name, { [SINGLE_VIEWER_TAB_METADATA_KEY]: true });

        return;
      }

      openTab(path, name);
    },
    [activeTab, collapseSidebarIfExpanded, openSingleFileTab, openTab, pathname],
  );

  const handleDatasetOpen = useCallback(
    (datasetId: string, name: string) => {
      collapseSidebarIfExpanded();

      if (shouldUseSingleViewerMode(pathname, activeTab)) {
        openSingleDatasetTab(datasetId, name, { [SINGLE_VIEWER_TAB_METADATA_KEY]: true });

        return;
      }

      openDatasetTab(datasetId, name);
    },
    [activeTab, collapseSidebarIfExpanded, openDatasetTab, openSingleDatasetTab, pathname],
  );

  const handleTaskOpen = useCallback(
    (taskId: string, name: string, fullRoute?: string) => {
      collapseSidebarIfExpanded();
      const route =
        fullRoute ??
        preserveSidebarParam(
          getChatTaskRoute({ taskId, conversationId: conversationId ?? undefined, taskTitle: name, inChat: true }),
        );

      if (shouldUseSingleViewerMode(pathname, activeTab)) {
        openSingleTaskTab(taskId, name || taskId, { [SINGLE_VIEWER_TAB_METADATA_KEY]: true }, route);

        return;
      }

      openTaskTab(taskId, name || taskId, undefined, route);
    },
    [activeTab, collapseSidebarIfExpanded, conversationId, openSingleTaskTab, openTaskTab, pathname],
  );

  const handleBrowserOpen = useCallback(
    (browserConversationId: string, sessionId?: string) => {
      collapseSidebarIfExpanded();

      if (shouldUseSingleViewerMode(pathname, activeTab)) {
        openSingleBrowserTab(browserConversationId, 'Browser', {
          ...(sessionId ? { sessionId } : {}),
          [SINGLE_VIEWER_TAB_METADATA_KEY]: true,
        });

        return;
      }

      openBrowserTab(browserConversationId, 'Browser', sessionId ? { sessionId } : undefined);
    },
    [activeTab, collapseSidebarIfExpanded, openBrowserTab, openSingleBrowserTab, pathname],
  );

  const handleGlobalInputRequired = useCallback(() => {
    void refetchConversationHistory();
  }, [refetchConversationHistory]);

  const handleBrowserStreamingEnd = useCallback(
    (browserConversationId: string) => {
      updateBrowserTab(browserConversationId, browserConversationId, 'Browser', {
        status: BrowserViewerDisplayState.ENDED,
      });
    },
    [updateBrowserTab],
  );

  const handleHitlRespondComplete = useCallback(() => {
    void refetchConversationHistory();
  }, [refetchConversationHistory]);

  useEffect(() => {
    setIsConversationNotFound(false);
  }, [conversationId]);

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.INPUT_REQUIRED, handleGlobalInputRequired);

    return () => sub.unsubscribe();
  }, [sseEventBus, handleGlobalInputRequired]);

  const handleTaskHitlRespondComplete = useCallback(
    (event: { type: EVENT_TYPE; payload?: string | Record<string, unknown> }) => {
      if (event?.payload === HITL_RESPONDED_EVENT) {
        void refetchConversationHistory();
      }
    },
    [refetchConversationHistory],
  );

  useEffect(() => {
    const sub = sseEventBus.subscribe(EVENT_TYPE.COMPONENT, handleTaskHitlRespondComplete);

    return () => sub.unsubscribe();
  }, [sseEventBus, handleTaskHitlRespondComplete]);

  useEffect(() => {
    const el = scrollContainerRef.current?.getScrollElement();

    if (!el) return;

    const handleScroll = () => {
      conversationScrollCache.set(scrollCacheKey, el.scrollTop);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });

    return () => el.removeEventListener('scroll', handleScroll);
  }, [scrollCacheKey, isLoadingConversationHistory]);

  useEffect(() => {
    if (isLoadingConversationHistory) return;
    if (restoredScrollKeyRef.current === scrollCacheKey) return;

    const el = scrollContainerRef.current?.getScrollElement();

    if (!el) return;

    restoredScrollKeyRef.current = scrollCacheKey;
    const saved = conversationScrollCache.get(scrollCacheKey);

    if (saved == null) return;

    const raf = requestAnimationFrame(() => {
      if (!el.isConnected) return;
      el.scrollTop = saved;
    });

    return () => cancelAnimationFrame(raf);
  }, [scrollCacheKey, isLoadingConversationHistory]);

  const isConversationHistoryReady =
    Boolean(conversationId) && !isLoadingConversationHistory && !isFetchingConversationHistory;

  const renderChatInput = () => {
    if (isViewer) {
      return (
        <div className='border-GRAY_400 bg-GRAY_50 flex min-h-[88px] items-center justify-center rounded-xl border px-4'>
          <span className='f-13-400 text-GRAY_600'>
            {isConversationHistoryReady && initiatedBy ? `This is a conversation between Zamp and ${initiatedBy}` : ''}
          </span>
        </div>
      );
    }

    if (hasInputsRequired) {
      return (
        <div ref={hitlWrapperRef}>
          <HITLQuestionsBlock
            key={hitlQuestionsKey}
            payload={{ questions: hitlQuestions }}
            onSubmit={handleHitlRespondComplete}
            sourceEntityId={conversationId ?? ''}
            sourceEntityType={HITLEntityType.CONVERSATION}
            conversationId={conversationId ?? ''}
            username={username}
            llmModel={selectedModel}
          />
        </div>
      );
    }

    return (
      <>
        <QueuedMessages messages={queuedMessages} />
        <ConnectedChatInput
          resourceType={ResourceType.ORGANIZATION}
          resourceId={organizationId}
          autoFocus
          scope={ScopeType.ORGANIZATION}
          scopeId={organizationId}
          username={username}
          currentUserName={currentUserName}
          placeholder='Reply...'
          externalInputValue={inputValue}
          setExternalInputValue={setInputValue}
          fileDropHandlerRef={fileDropHandlerRef}
          llmModel={selectedModel}
          showModelSelector
          modelSelectorSlot={modelSelectorSlot}
          conversationId={conversationId ?? ''}
          addFileReferenceRef={addFileReferenceRef}
          addMentionRef={addMentionRef}
          externalFileReferences={sharedFileReferences}
          setExternalFileReferences={setSharedFileReferences}
          externalFilePathsRef={sharedExternalFilePaths}
          metadata={
            activeAgentInfo?.id || activeFileInfo
              ? {
                  ...(activeAgentInfo?.id && {
                    agent_id: activeAgentInfo.id,
                    ...(activeAgentInfo.avatar && { avatar: activeAgentInfo.avatar }),
                  }),
                  ...(activeFileInfo && {
                    file_path: activeFileInfo.path,
                    file_name: activeFileInfo.name,
                  }),
                }
              : undefined
          }
          referencePicker={referencePicker}
          className={cn('rounded-[32px]', queuedMessages.length > 0 && '-mt-3')}
          inputAreaClassName='px-5 pt-4 pb-3'
          footerClassName='px-3.5 pt-2 pb-3.5'
        />
      </>
    );
  };

  return (
    <div className='bg-BG_WHITE relative mx-auto flex h-full w-full flex-1 flex-col' {...dropZoneProps}>
      <DropOverlay isVisible={isDragOver} />
      {!shouldShowScopedHome && (
        <div>
          <ChatTopbar
            title={chatTitle || 'Start a new chat'}
            conversationId={conversationId}
            organizationId={organizationId}
            onTitleChange={setChatTitle}
            onDeleteConversation={startNewChat}
          />
        </div>
      )}
      <ChatConversationContent
        conversationId={conversationId}
        organizationId={organizationId}
        onFileOpen={handleFileOpen}
        onDatasetOpen={handleDatasetOpen}
        onTaskOpen={handleTaskOpen}
        onBrowserOpen={handleBrowserOpen}
        onBrowserStreamingEnd={handleBrowserStreamingEnd}
        onTaskPopoverOpenChange={setIsTaskPopoverOpen}
        onConversationNotFound={setIsConversationNotFound}
        addFileReferenceRef={addFileReferenceRef}
        addMentionRef={addMentionRef}
        currentUserName={currentUserName}
        scrollContainerRef={scrollContainerRef}
        emptyState={shouldShowScopedHome ? <ChatHome /> : undefined}
      />

      {!isConversationNotFound && (
        <ChatActionsProvider onFileOpen={handleFileOpen} onDatasetOpen={handleDatasetOpen} onTaskOpen={handleTaskOpen}>
          <div className='bg-BG_WHITE sticky bottom-0 z-10 mx-auto w-full max-w-[700px] px-5 pb-5'>
            {renderChatInput()}
          </div>
        </ChatActionsProvider>
      )}
      {isTaskPopoverOpen && (
        <div aria-hidden className='bg-GRAY_70 pointer-events-none absolute inset-0 z-40 backdrop-blur-xs' />
      )}
    </div>
  );
};

export default ChatSidebarContent;
