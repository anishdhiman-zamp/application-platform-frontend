'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HITLEntityType, HITLQuestionsBlock, ResourceType, ScopeType } from '@zamp-platform/chat';
import { ConnectedChatInput, useConversationActions, useConversationState } from '@zamp-platform/conversation-stream';
import { cn } from '@zamp-platform/ui/utils';
import { EVENT_TYPE } from '@zamp-platform/utils/event-bus';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import ChatConversationContent from 'modules/pace/components/layout/chat-sidebar/ChatConversationContent';
import { useEventBus } from '@/app/_providers/sse-provider';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import ModelSelector from '@/modules/pace/components/chat/ModelSelector';
import { useChatDraftInput } from '@/modules/pace/hooks/useChatDraftInput';
import { useHitlQuestions } from '@/modules/pace/hooks/useHitlQuestions';
import { BrowserViewerDisplayState } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';

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
  const { chatSidebarState, setChatSidebarState, setActiveAgentInfo, selectedModel, setSelectedModel } =
    usePaceContext();
  const { inputValue, setInputValue } = useChatDraftInput({
    conversationId,
  });
  const { inputsRequired, isStreaming } = useConversationState();
  const { refetchConversationHistory } = useConversationActions();
  const { sseEventBus } = useEventBus();

  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);
  const addFileReferenceRef = useRef<((ref: { path: string; name: string }) => void) | null>(null);

  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false);

  const { hitlQuestions, hitlQuestionsKey } = useHitlQuestions(inputsRequired);
  const hasInputsRequired = (inputsRequired?.length ?? 0) > 0;

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
    const sub = sseEventBus.subscribe(EVENT_TYPE.INPUT_REQUIRED, handleGlobalInputRequired);

    return () => sub.unsubscribe();
  }, [sseEventBus, handleGlobalInputRequired]);

  return (
    <div className='bg-BG_WHITE relative mx-auto flex h-full w-full flex-1 flex-col'>
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
        fileDropHandlerRef={fileDropHandlerRef}
        addFileReferenceRef={addFileReferenceRef}
        currentUserName={currentUserName}
      />

      <div className='bg-BG_WHITE sticky bottom-0 z-10 mx-auto w-full max-w-[700px] px-3 pb-3'>
        {hasInputsRequired ? (
          <HITLQuestionsBlock
            key={hitlQuestionsKey}
            payload={{ questions: hitlQuestions }}
            onSubmit={handleHitlRespondComplete}
            sourceEntityId={conversationId ?? ''}
            sourceEntityType={HITLEntityType.CONVERSATION}
          />
        ) : (
          <ConnectedChatInput
            resourceType={ResourceType.ORGANIZATION}
            resourceId={organizationId}
            autoFocus
            scope={ScopeType.ORGANIZATION}
            scopeId={organizationId}
            username={username}
            currentUserName={currentUserName}
            placeholder="Do your life's best work with Pace"
            externalInputValue={inputValue}
            setExternalInputValue={setInputValue}
            fileDropHandlerRef={fileDropHandlerRef}
            llmModel={selectedModel}
            showModelSelector
            modelSelectorSlot={modelSelectorSlot}
            conversationId={conversationId ?? ''}
            isDisabled={isStreaming}
            addFileReferenceRef={addFileReferenceRef}
          />
        )}
      </div>
    </div>
  );
};

export default ChatSidebarContent;
