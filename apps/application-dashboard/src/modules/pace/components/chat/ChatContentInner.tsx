'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
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
import { ArrowDownIcon, Button, CSS_VARS } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { APITags } from '@/constants/api.constants';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import NewPaceAvatar from '@/modules/chatbot/NewPaceAvatar';
import ChatHistory from '@/modules/pace/components/chat/ChatHistory';
import ChatHome from '@/modules/pace/components/chat/ChatHome';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { useChatDraftInput } from '@/modules/pace/hooks/useChatDraftInput';
import { useChatScroll } from '@/modules/pace/hooks/useChatScroll';
import { SIDEBAR_CONVERSATION_ID_PARAM } from '@/modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import { baseApi } from '@/services/baseApi';
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
  const dispatch = useAppDispatch();
  const userAvatarBg = CSS_VARS.ORANGE_400;

  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const { inputValue, setInputValue } = useChatDraftInput({ conversationId });

  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);

  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const { setIsPaceSidebarOpen } = usePaceContext();

  const handleConversationCreated = () => {
    dispatch(baseApi.util.invalidateTags([APITags.GET_CONVERSATION_HISTORY]));
  };

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

  const isLoadingConversation = Boolean(conversationId && chat.isLoadingConversationHistory) || !hasMessages;
  const isInConversation = Boolean(conversationId || chat.conversationId || hasMessages);

  const { scrollContainerRef, showScrollButton, handleScroll, handleScrollToBottomClick } = useChatScroll({
    messagesLength: chat.messages?.length ?? 0,
    isLoading: isLoadingConversation,
    streamingState: chat.streamingState,
  });

  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: chat.isStreaming || chat.isCreatingConversationV2,
  });

  useEffect(() => {
    if (chat.conversationId && !conversationId) {
      setConversationId(chat.conversationId);
    }
  }, [chat.conversationId, conversationId, setConversationId]);

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
          />
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className='relative flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto [scrollbar-width:thin]'
          >
            <CommonWrapper
              isLoading={isLoadingConversation}
              isError={chat.isErrorConversationHistory}
              refetchFunction={chat.refetchConversationHistory}
              skeletonType={SkeletonTypes.CUSTOM}
              loader={<ChatMessagesSkeleton className='px-0' alignUserRight hideSenderName />}
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
                hideSenderName
                organizationId={organizationId}
                userAvatarBackgroundColor={userAvatarBg}
              />
              <div className='bg-BG_WHITE h-12 w-full' />
            </CommonWrapper>
            <div className='bg-BG_WHITE sticky bottom-0 z-10 mx-auto w-full max-w-[700px] pb-3'>
              <Button
                onClick={handleScrollToBottomClick}
                variant='ghost'
                className={cn(
                  'bg-GRAY_1000 hover:bg-GRAY_950 absolute -top-10 left-1/2 h-6 w-6 -translate-x-1/2 !rounded-full p-3',
                  'transition-all duration-200 ease-out',
                  showScrollButton ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
                )}
                aria-label='Scroll to bottom'
              >
                <ArrowDownIcon size={14} className='text-BG_WHITE p-[2px]' />
              </Button>
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
        </div>
      </ChatActionsProvider>
    );
  }

  return (
    <ChatActionsProvider onFileOpen={handleFileOpen}>
      <div
        className='relative mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col overflow-hidden'
        {...dropZoneProps}
      >
        <DropOverlay isVisible={isDragOver} />
        <ChatHome />
        <div className='w-full shrink-0 p-3 pt-4'>
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
            onConversationCreated={handleConversationCreated}
            fileDropHandlerRef={fileDropHandlerRef}
            minTextareaHeight={48}
            maxTextareaHeight={200}
            llmModel={selectedModel}
            showModelSelector
            modelSelectorSlot={modelSelectorSlot}
          />
        </div>
        <ChatHistory onSelectConversation={setConversationId} />
      </div>
    </ChatActionsProvider>
  );
};

export default ChatContentInner;
