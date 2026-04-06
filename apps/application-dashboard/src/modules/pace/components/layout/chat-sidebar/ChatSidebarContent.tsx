'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HITLEntityType, HITLQuestionsBlock, ResourceType, ScopeType } from '@zamp-platform/chat';
import { ConnectedChatInput, useConversationActions, useConversationState } from '@zamp-platform/conversation-stream';
import { cn } from '@zamp-platform/ui/utils';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import ChatConversationContent from 'modules/pace/components/layout/chat-sidebar/ChatConversationContent';
import { APITags } from '@/constants/api.constants';
import { FEATURE_FLAGS } from '@/constants/featureFlags';
import { useAppDispatch } from '@/hooks/toolkit';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import AutoLoopConfirmDialog from '@/modules/pace/components/chat/AutoLoopConfirmDialog';
import AutoLoopToggle from '@/modules/pace/components/chat/AutoLoopToggle';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import ModelSelector from '@/modules/pace/components/chat/ModelSelector';
import { useChatDraftInput } from '@/modules/pace/hooks/useChatDraftInput';
import { useHitlQuestions } from '@/modules/pace/hooks/useHitlQuestions';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';
import { addAutoLoopLockedConversation, isConversationAutoLoopLocked } from '@/modules/pace/utils/autoLoopStorage';
import { baseApi } from '@/services/baseApi';

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
  const dispatch = useAppDispatch();
  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const { openTab: openBrowserTab } = useDynamicTabs({ type: TAB_TYPE.BROWSER });
  const { chatSidebarState, setChatSidebarState, selectedModel, setSelectedModel } = usePaceContext();
  const { inputValue, setInputValue } = useChatDraftInput({ conversationId });
  const { inputsRequired, isStreaming } = useConversationState();
  const { refetchConversationHistory } = useConversationActions();
  const { isEnabled: isAutoLoopBtnEnabled } = useFeatureFlag(FEATURE_FLAGS.AUTO_LOOP_BTN_ENABLED);

  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);
  const addFileReferenceRef = useRef<((ref: { path: string; name: string }) => void) | null>(null);

  const [autoLoopEnabled, setAutoLoopEnabled] = useState(false);
  const [isAutoLoopLocked, setIsAutoLoopLocked] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false);

  const { hitlQuestions, hitlQuestionsKey } = useHitlQuestions(inputsRequired);
  const hasInputsRequired = (inputsRequired?.length ?? 0) > 0;

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

  const handleTaskOpen = useCallback(() => {
    if (chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED) {
      setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
    }
  }, [chatSidebarState, setChatSidebarState]);

  const handleBrowserOpen = useCallback(
    (browserConversationId: string) => {
      if (chatSidebarState === CHAT_SIDEBAR_STATE.EXPANDED) {
        setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
      }
      openBrowserTab(browserConversationId, 'Browser');
    },
    [openBrowserTab, chatSidebarState, setChatSidebarState],
  );

  const handleHitlRespondComplete = useCallback(() => {
    void refetchConversationHistory();
  }, [refetchConversationHistory]);

  const handleConversationCreated = useCallback(() => {
    dispatch(baseApi.util.invalidateTags([APITags.GET_CONVERSATION_HISTORY]));
  }, [dispatch]);

  const modelSelectorSlot = useMemo(
    () => <ModelSelector value={selectedModel} onChange={setSelectedModel} />,
    [selectedModel],
  );

  const autoLoopToggleSlot = useMemo(
    () => (
      <AutoLoopToggle
        enabled={autoLoopEnabled}
        onChange={(pressed) => {
          if (pressed) setIsConfirmDialogOpen(true);
        }}
        disabled={isAutoLoopLocked}
      />
    ),
    [autoLoopEnabled, isAutoLoopLocked],
  );

  useEffect(() => {
    const locked = isConversationAutoLoopLocked(conversationId);

    setIsAutoLoopLocked(locked);
    setAutoLoopEnabled(locked);
  }, [conversationId]);

  return (
    <div className='bg-BG_WHITE relative mx-auto flex h-full w-full flex-1 flex-col'>
      <div className={cn('transition-[filter] duration-200', isTaskPopoverOpen && 'pointer-events-none blur-sm')}>
        <ChatTopbar
          title={chatTitle || 'Start a new chat'}
          conversationId={conversationId}
          organizationId={organizationId}
          onStartNewChat={startNewChat}
          onTitleChange={setChatTitle}
          onSelectConversation={setConversationId}
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
            autoLoopEnabled={autoLoopEnabled}
            showModelSelector
            modelSelectorSlot={modelSelectorSlot}
            {...(isAutoLoopBtnEnabled && { autoLoopToggleSlot })}
            conversationId={conversationId ?? ''}
            onConversationCreated={handleConversationCreated}
            isDisabled={isStreaming}
            addFileReferenceRef={addFileReferenceRef}
          />
        )}
      </div>
      <AutoLoopConfirmDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={() => {
          setAutoLoopEnabled(true);
          setIsAutoLoopLocked(true);
          if (conversationId) {
            addAutoLoopLockedConversation(conversationId);
          }
        }}
      />
    </div>
  );
};

export default ChatSidebarContent;
