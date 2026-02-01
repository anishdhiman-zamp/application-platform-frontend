'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  ConnectedChatInput,
  DropOverlay,
  MessageContainer,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
  useFileDragDrop,
} from '@zamp-platform/chat';
import { ArrowDownIcon, Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ACCEPTED_FILE_TYPES } from 'modules/pace/pace.constants';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { APITags } from '@/constants/api.constants';
import { useAppDispatch } from '@/hooks/toolkit';
import NewPaceAvatar from '@/modules/chatbot/NewPaceAvatar';
import ChatHistory from '@/modules/pace/components/chat/ChatHistory';
import ChatHome from '@/modules/pace/components/chat/ChatHome';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { useChatDraftInput } from '@/modules/pace/hooks/useChatDraftInput';
import { useChatScroll } from '@/modules/pace/hooks/useChatScroll';
import { baseApi } from '@/services/baseApi';

interface ChatContentInnerProps {
  organizationId: string;
  currentUserName: string;
  conversationId: string | null;
  setConversationId: (id: string | null) => void;
  setChatTitle: (title: string) => void;
  chatTitle: string;
  startNewChat: () => void;
}

const ChatContentInner = ({
  organizationId,
  currentUserName,
  conversationId,
  setConversationId,
  setChatTitle,
  chatTitle,
  startNewChat,
}: ChatContentInnerProps) => {
  const dispatch = useAppDispatch();
  const { inputValue, setInputValue } = useChatDraftInput({ conversationId });
  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);

  const handleConversationCreated = () => {
    dispatch(baseApi.util.invalidateTags([APITags.GET_CONVERSATION_HISTORY]));
  };

  const chat = useChat({
    resourceId: organizationId,
    resourceType: ResourceType.ORGANIZATION,
    conversationId: conversationId ?? undefined,
    enableStreaming: true,
    apiConfig: {
      sendMessage: API_ENDPOINTS.POST_MESSAGE_V3,
      createConversation: API_ENDPOINTS.CREATE_CONVERSATION_V3,
    },
    setHeader: (header: string) => {
      setChatTitle(header);
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
    acceptedFileTypes: ACCEPTED_FILE_TYPES,
  });

  useEffect(() => {
    if (chat.conversationId && !conversationId) {
      setConversationId(chat.conversationId);
    }
  }, [chat.conversationId, conversationId, setConversationId]);

  if (isInConversation) {
    return (
      <div className='relative flex h-full flex-1 flex-col' {...dropZoneProps}>
        <DropOverlay isVisible={isDragOver} />
        <ChatTopbar title={chatTitle || 'Untitled'} onStartNewChat={startNewChat} />
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
            />
            <div className='h-12 w-full bg-white' />
          </CommonWrapper>
          <div className='sticky bottom-0 z-10 mx-auto w-full max-w-[700px] bg-white pb-3'>
            <Button
              onClick={handleScrollToBottomClick}
              variant='ghost'
              className={cn(
                'bg-gray-1000 hover:bg-gray-1000 absolute -top-10 left-1/2 h-6 w-6 -translate-x-1/2 !rounded-full p-3',
                'transition-all duration-200 ease-out',
                showScrollButton ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
              )}
              aria-label='Scroll to bottom'
            >
              <ArrowDownIcon size={14} className='p-[2px] text-white' />
            </Button>
            <ConnectedChatInput
              chat={chat}
              conversationId={conversationId ?? chat.conversationId ?? ''}
              resourceType={ResourceType.ORGANIZATION}
              resourceId={organizationId}
              scope={ScopeType.ORGANIZATION}
              scopeId={organizationId}
              organizationId={organizationId}
              currentUserName={currentUserName}
              isDisabled={chat.isStreaming || chat.isCreatingConversationV2}
              placeholder="Do your life's best work with Pace"
              externalInputValue={inputValue}
              setExternalInputValue={setInputValue}
              acceptedFileTypes={ACCEPTED_FILE_TYPES}
              fileDropHandlerRef={fileDropHandlerRef}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className='relative mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col overflow-hidden'
      {...dropZoneProps}
    >
      <DropOverlay isVisible={isDragOver} />
      <ChatHome />
      <div className='w-full shrink-0 p-3'>
        <ConnectedChatInput
          chat={chat}
          conversationId={chat.conversationId ?? ''}
          resourceType={ResourceType.ORGANIZATION}
          resourceId={organizationId}
          scope={ScopeType.ORGANIZATION}
          scopeId={organizationId}
          organizationId={organizationId}
          currentUserName={currentUserName}
          placeholder="Do your life's best work with Pace"
          externalInputValue={inputValue}
          setExternalInputValue={setInputValue}
          acceptedFileTypes={ACCEPTED_FILE_TYPES}
          onConversationCreated={handleConversationCreated}
          fileDropHandlerRef={fileDropHandlerRef}
        />
      </div>
      <ChatHistory onSelectConversation={setConversationId} />
    </div>
  );
};

export default ChatContentInner;
