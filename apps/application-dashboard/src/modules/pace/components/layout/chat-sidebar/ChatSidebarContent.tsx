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
import { ConnectedChatInput, useConversationActions, useConversationState } from '@zamp-platform/conversation-stream';
import { type ScrollContainerRef } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import ChatConversationContent from 'modules/pace/components/layout/chat-sidebar/ChatConversationContent';
import { useEventBus } from '@/app/_providers/sse-provider';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import ModelSelector from '@/modules/pace/components/chat/ModelSelector';
import { HITL_RESPONDED_EVENT } from '@/modules/pace/components/tasks/constants/tasks.constants';
import { useChatDraftInput } from '@/modules/pace/hooks/useChatDraftInput';
import { useHitlQuestions } from '@/modules/pace/hooks/useHitlQuestions';
import { BrowserViewerDisplayState } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';
import {
  CONVERSATION_ACCESS_PRIVILEGES,
  ResourceType as ShareResourceType,
  ShareResourceVersion,
} from '@/modules/shareResource/shareResource.types';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

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
  setConversationId,
  setChatTitle,
  startNewChat,
  chatTitle,
  organizationId,
  currentUserName,
  username,
}: ChatSidebarContentProps) => {
  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });

  const { openTab: openTaskTab } = useDynamicTabs({ type: TAB_TYPE.TASK });
  const { openTab: openBrowserTab, updateTab: updateBrowserTab } = useDynamicTabs({ type: TAB_TYPE.BROWSER });
  const {
    chatSidebarState,
    setChatSidebarState,
    activeAgentInfo,
    setActiveAgentInfo,
    selectedModel,
    setSelectedModel,
    sharedFileReferences,
    setSharedFileReferences,
    sharedExternalFilePaths,
  } = usePaceContext();
  const { inputValue, setInputValue } = useChatDraftInput({
    conversationId,
  });
  const { inputsRequired, queuedMessages, initiatedBy, isLoadingConversationHistory, isFetchingConversationHistory } =
    useConversationState();
  const { refetchConversationHistory } = useConversationActions();
  const { sseEventBus } = useEventBus();

  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);
  const addFileReferenceRef = useRef<((ref: { path: string; name: string }) => void) | null>(null);
  const scrollContainerRef = useRef<ScrollContainerRef | null>(null);
  const hitlWrapperRef = useRef<HTMLDivElement>(null);
  const hitlHeightRef = useRef(0);

  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false);
  const [isConversationNotFound, setIsConversationNotFound] = useState(false);

  const { hitlQuestions, hitlQuestionsKey } = useHitlQuestions(inputsRequired);
  const hasInputsRequired = (inputsRequired?.length ?? 0) > 0;

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

  const handleExpand = useCallback(() => {
    setChatSidebarState(CHAT_SIDEBAR_STATE.EXPANDED);
  }, [setChatSidebarState]);

  const handleFileOpen = useCallback(
    (path: string, name: string) => {
      if (chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED) {
        setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
      }
      openTab(path, name);
    },
    [openTab, chatSidebarState, setChatSidebarState],
  );

  const handleTaskOpen = useCallback(
    (taskId: string, name: string, fullRoute: string) => {
      if (chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED) {
        setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
      }
      openTaskTab(taskId, name || taskId, undefined, fullRoute);
    },
    [chatSidebarState, setChatSidebarState, openTaskTab],
  );

  const handleBrowserOpen = useCallback(
    (browserConversationId: string, sessionId?: string) => {
      if (chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED) {
        setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
      }
      openBrowserTab(browserConversationId, 'Browser', sessionId ? { sessionId } : undefined);
    },
    [openBrowserTab, chatSidebarState, setChatSidebarState],
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

  const handleSelectConversation = useCallback(
    (id: string | null, title?: string) => {
      setActiveAgentInfo(null);
      setConversationId(id, title);
    },
    [setActiveAgentInfo, setConversationId],
  );

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
          placeholder="Do your life's best work with Zamp"
          externalInputValue={inputValue}
          setExternalInputValue={setInputValue}
          fileDropHandlerRef={fileDropHandlerRef}
          llmModel={selectedModel}
          showModelSelector
          modelSelectorSlot={modelSelectorSlot}
          conversationId={conversationId ?? ''}
          addFileReferenceRef={addFileReferenceRef}
          externalFileReferences={sharedFileReferences}
          setExternalFileReferences={setSharedFileReferences}
          externalFilePathsRef={sharedExternalFilePaths}
          metadata={
            activeAgentInfo?.id
              ? {
                  agent_id: activeAgentInfo.id,
                  ...(activeAgentInfo.avatar && { avatar: activeAgentInfo.avatar }),
                }
              : undefined
          }
          className={queuedMessages.length > 0 ? '-mt-3' : undefined}
        />
      </>
    );
  };

  return (
    <div className='bg-BG_WHITE relative mx-auto flex h-full w-full flex-1 flex-col' {...dropZoneProps}>
      <DropOverlay isVisible={isDragOver} />
      <div className={cn('transition-[filter] duration-200', isTaskPopoverOpen && 'pointer-events-none blur-sm')}>
        <ChatTopbar
          title={chatTitle || 'Start a new chat'}
          conversationId={conversationId}
          organizationId={organizationId}
          onStartNewChat={startNewChat}
          onTitleChange={setChatTitle}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={startNewChat}
          onExpand={chatSidebarState !== CHAT_SIDEBAR_STATE.EXPANDED ? handleExpand : undefined}
        />
      </div>
      <ChatConversationContent
        conversationId={conversationId}
        organizationId={organizationId}
        onFileOpen={handleFileOpen}
        onTaskOpen={handleTaskOpen}
        onBrowserOpen={handleBrowserOpen}
        onBrowserStreamingEnd={handleBrowserStreamingEnd}
        onTaskPopoverOpenChange={setIsTaskPopoverOpen}
        onConversationNotFound={setIsConversationNotFound}
        addFileReferenceRef={addFileReferenceRef}
        currentUserName={currentUserName}
        scrollContainerRef={scrollContainerRef}
      />

      {!isConversationNotFound && (
        <ChatActionsProvider onFileOpen={handleFileOpen}>
          <div
            className={cn(
              'bg-BG_WHITE sticky bottom-0 mx-auto w-full max-w-[700px] px-3 pb-3',
              isTaskPopoverOpen ? 'z-0' : 'z-10',
            )}
          >
            {renderChatInput()}
          </div>
        </ChatActionsProvider>
      )}
    </div>
  );
};

export default ChatSidebarContent;
