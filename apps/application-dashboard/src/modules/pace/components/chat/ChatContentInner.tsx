'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChatActionsProvider,
  ConnectedChatInput,
  DropOverlay,
  MessageContainer,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
  useFileDragDrop,
} from '@zamp-platform/chat';
import { ScrollContainer } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import ChatHistory from 'modules/pace/components/chat/ChatHistory';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import NewPaceAvatar from '@/modules/chatbot/NewPaceAvatar';
import ChatHome from '@/modules/pace/components/chat/ChatHome';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import TaskStatusCounts from '@/modules/pace/components/chat/TaskStatusCounts';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { useChatDraftInput } from '@/modules/pace/hooks/useChatDraftInput';
import { SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import { RootState } from '@/store';

interface ChatContentInnerProps {
  organizationId: string;
  username: string;
  conversationId: string | null;
  setConversationId: (id: string | null, title?: string) => void;
  setChatTitle: (title: string) => void;
  chatTitle: string;
  startNewChat: () => void;
  selectedModel: string | null;
  modelSelectorSlot: React.ReactNode;
}

const ChatContentInner = ({
  organizationId,
  username,
  conversationId,
  setConversationId,
  setChatTitle,
  chatTitle,
  startNewChat,
  selectedModel,
  modelSelectorSlot,
}: ChatContentInnerProps) => {
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const { inputValue, setInputValue } = useChatDraftInput({ conversationId });

  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false);

  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const { setIsPaceSidebarOpen } = usePaceContext();

  const chat = useChat({
    resourceId: organizationId,
    resourceType: ResourceType.ORGANIZATION,
    conversationId: conversationId ?? undefined,
    enableStreaming: true,
    setHeader: (header: string) => {
      if (!chatTitle) {
        setChatTitle(header);
      }
    },
  });

  const hasMessages = useMemo(() => chat.messages.length > 0, [chat.messages]);

  const isAnalysing = useMemo(() => {
    return chat.messages.length > 0 && chat.messages[chat.messages.length - 1]?.sender_type === SenderType.USER;
  }, [chat.messages]);

  const lastMessageSenderType = useMemo(() => chat.messages[chat.messages.length - 1]?.sender_type, [chat.messages]);
  const isLoadingConversation = Boolean(conversationId && chat.isLoadingConversationHistory) || !hasMessages;
  const isInConversation = Boolean(conversationId || chat.conversationId || hasMessages);

  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: chat.isStreaming || chat.isCreatingConversationV2,
  });

  useEffect(() => {
    if (chat.conversationId && !conversationId) {
      setConversationId(chat.conversationId);
    }
  }, [chat.conversationId, conversationId, setConversationId]);

  const handleDeleteConversation = useCallback(
    (deletedId: string) => {
      if (conversationId === deletedId) {
        startNewChat();
      }
    },
    [conversationId, startNewChat],
  );

  const handleFileOpen = useCallback(
    (path: string, name: string) => {
      const currentConversationId = conversationId ?? chat.conversationId;

      if (currentConversationId) {
        setIsPaceSidebarOpen(true);
        const params = new URLSearchParams(window.location.search);

        params.set(SIDEBAR_CONVERSATION_ID_PARAM, currentConversationId);
        const newUrl = `${window.location.pathname}?${params.toString()}`;

        window.history.replaceState(null, '', newUrl);
      }
      openTab(path, name);
    },
    [openTab, conversationId, chat.conversationId, setIsPaceSidebarOpen],
  );

  if (isInConversation) {
    return (
      <ChatActionsProvider onFileOpen={handleFileOpen}>
        <div className='bg-BG_WHITE relative flex h-full flex-1 flex-col' {...dropZoneProps}>
          <DropOverlay isVisible={isDragOver} />
          <ChatTopbar
            title={chatTitle || 'Untitled'}
            conversationId={conversationId ?? chat.conversationId}
            organizationId={organizationId}
            onStartNewChat={startNewChat}
            onTitleChange={setChatTitle}
            onDeleteConversation={startNewChat}
          />
          <ScrollContainer
            showScrollToBottom
            enableAnchorScroll
            scrollTrigger={chat.messages?.length}
            lastMessageSenderType={lastMessageSenderType}
            isLoading={isLoadingConversation}
            streamingState={chat.streamingState}
            disableFadeOverlay={isTaskPopoverOpen}
            scrollClassName={cn('bg-BG_WHITE', isTaskPopoverOpen ? 'overflow-y-hidden' : 'overflow-y-scroll')}
          >
            <CommonWrapper
              isLoading={isLoadingConversation}
              isError={chat.isErrorConversationHistory}
              refetchFunction={chat.refetchConversationHistory}
              skeletonType={SkeletonTypes.CUSTOM}
              loader={<ChatMessagesSkeleton className='px-0' alignUserRight />}
              className='mx-auto flex w-full max-w-[700px] flex-1 flex-col px-4'
              disableAnimation
            >
              <MessageContainer
                conversationId={conversationId || chat.conversationId || ''}
                messages={chat.messages}
                isAnalysing={isAnalysing}
                streamingState={chat.streamingState}
                className='gap-4 px-0 [&]:overflow-visible'
                assistantAvatar={<NewPaceAvatar />}
                showTimestamp
                showFeedback
                showCopy
                alignUserRight
                organizationId={organizationId}
              />
            </CommonWrapper>
          </ScrollContainer>
          <div ref={inputContainerRef} className='bg-BG_WHITE sticky bottom-0 z-10 mx-auto w-full max-w-[700px] pb-3'>
            <TaskStatusCounts
              messages={chat.messages}
              streamingState={chat.streamingState}
              conversationId={conversationId ?? chat.conversationId ?? ''}
              containerRef={inputContainerRef}
              onOpenChange={setIsTaskPopoverOpen}
            />
            <ConnectedChatInput
              chat={chat}
              autoFocus
              conversationId={conversationId ?? chat.conversationId ?? ''}
              resourceType={ResourceType.ORGANIZATION}
              resourceId={organizationId}
              scope={ScopeType.ORGANIZATION}
              scopeId={organizationId}
              username={username}
              currentUserName={currentUserName}
              isDisabled={chat.isStreaming || chat.isCreatingConversationV2}
              placeholder="Do your life's best work with Pace"
              externalInputValue={inputValue}
              setExternalInputValue={setInputValue}
              fileDropHandlerRef={fileDropHandlerRef}
              llmModel={selectedModel}
              showModelSelector
              modelSelectorSlot={modelSelectorSlot}
            />
          </div>
        </div>
      </ChatActionsProvider>
    );
  }

  return (
    <ChatActionsProvider onFileOpen={handleFileOpen}>
      <div
        className='relative mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col items-center justify-start overflow-hidden pt-[15vh]'
        {...dropZoneProps}
      >
        <DropOverlay isVisible={isDragOver} />
        <ChatHome />
        <div className='mt-7 w-full shrink-0 px-3'>
          <ConnectedChatInput
            chat={chat}
            conversationId={chat.conversationId ?? ''}
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
            minTextareaHeight={18}
            maxTextareaHeight={200}
            llmModel={selectedModel}
            showModelSelector
            modelSelectorSlot={modelSelectorSlot}
            className='shadow-chatbot-shadow'
          />
        </div>

        <ChatHistory onSelectConversation={setConversationId} onDeleteConversation={handleDeleteConversation} />
      </div>
    </ChatActionsProvider>
  );
};

export default ChatContentInner;
