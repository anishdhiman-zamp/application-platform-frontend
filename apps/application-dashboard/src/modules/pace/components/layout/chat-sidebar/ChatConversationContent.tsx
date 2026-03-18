'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { ArrowDownIcon, Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import ChatHistory from 'modules/pace/components/chat/ChatHistory';
import ChatHome from 'modules/pace/components/chat/ChatHome';
import type { ChatState } from 'modules/pace/components/layout/chat-sidebar/ChatSidebarInner';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { APITags } from '@/constants/api.constants';
import { useAppDispatch } from '@/hooks/toolkit';
import NewPaceAvatar from '@/modules/chatbot/NewPaceAvatar';
import ScrollFadeOverlay from '@/modules/pace/components/chat/ScrollFadeOverlay';
import TaskStatusCounts from '@/modules/pace/components/chat/TaskStatusCounts';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { useChatScroll } from '@/modules/pace/hooks/useChatScroll';
import { usePaceContext } from '@/modules/pace/pace.context';
import { baseApi } from '@/services/baseApi';

export interface ChatConversationContentProps {
  conversationId: string | null;
  setConversationId: (id: string | null, title?: string) => void;
  setChatTitle: (title: string) => void;
  chatTitle: string;
  organizationId: string;
  onFileOpen: (path: string, name: string) => void;
  onTaskOpen?: (name: string, path: string) => void;
  isOnChatRoute: boolean;
  onChatStateChange: (state: ChatState) => void;
  fileDropHandlerRef: React.RefObject<((files: FileList) => void) | null>;
  addFileReferenceRef: React.RefObject<((ref: { path: string; name: string }) => void) | null>;
}

const ChatConversationContent: FC<ChatConversationContentProps> = ({
  conversationId,
  setConversationId,
  setChatTitle,
  chatTitle,
  organizationId,
  onFileOpen,
  onTaskOpen,
  isOnChatRoute,
  onChatStateChange,
  fileDropHandlerRef,
  addFileReferenceRef,
}) => {
  const { pendingFileReference, clearPendingFileReference } = usePaceContext();
  const dispatch = useAppDispatch();

  const taskStatusContainerRef = useRef<HTMLDivElement>(null);

  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false);

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
  const showHomeView = isOnChatRoute && !isInConversation;

  const handleConversationCreated = useCallback(() => {
    dispatch(baseApi.util.invalidateTags([APITags.GET_CONVERSATION_HISTORY]));
  }, [dispatch]);

  const {
    scrollContainerRef,
    showScrollButton,
    canScrollTop,
    canScrollBottom,
    handleScroll,
    handleScrollToBottomClick,
  } = useChatScroll({
    messagesLength: chat.messages?.length ?? 0,
    isLoading: isLoadingConversation,
    streamingState: chat.streamingState,
  });

  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: chat.isStreaming || chat.isCreatingConversationV2,
  });

  useEffect(() => {
    if (chat.conversationId && chat.conversationId !== conversationId) {
      setConversationId(chat.conversationId, chatTitle);
    }
  }, [chat.conversationId, setConversationId]);

  useEffect(() => {
    if (pendingFileReference && addFileReferenceRef.current) {
      addFileReferenceRef.current(pendingFileReference);
      clearPendingFileReference();
    }
  }, [pendingFileReference, clearPendingFileReference, addFileReferenceRef]);

  useEffect(() => {
    onChatStateChange({ chat, isInConversation, showHomeView });
  }, [chat, isInConversation, showHomeView, onChatStateChange]);

  if (showHomeView) {
    return (
      <ChatActionsProvider onFileOpen={onFileOpen} onTaskOpen={onTaskOpen}>
        <div
          className='relative mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col items-center justify-start overflow-hidden pt-[15vh]'
          {...dropZoneProps}
        >
          <DropOverlay isVisible={isDragOver} />
          <ChatHome />
          <div className='mt-7 w-full shrink-0 px-3'>
            <ConnectedChatInput
              chat={chat}
              resourceType={ResourceType.ORGANIZATION}
              resourceId={organizationId}
              autoFocus
              scope={ScopeType.ORGANIZATION}
              scopeId={organizationId}
              username=''
              currentUserName=''
              placeholder="Do your life's best work with Pace"
              conversationId={chat.conversationId ?? ''}
              onConversationCreated={handleConversationCreated}
              minTextareaHeight={18}
              maxTextareaHeight={200}
              className='[box-shadow:0_0_16px_0_rgba(0,0,0,0.06)]'
              fileDropHandlerRef={fileDropHandlerRef}
            />
          </div>
          <ChatHistory onSelectConversation={setConversationId} />
        </div>
      </ChatActionsProvider>
    );
  }

  return (
    <ChatActionsProvider onFileOpen={onFileOpen} onTaskOpen={onTaskOpen}>
      <div className='relative flex min-h-0 w-full flex-1 flex-col overflow-hidden' {...dropZoneProps}>
        <DropOverlay isVisible={isDragOver} />
        {!isTaskPopoverOpen && <ScrollFadeOverlay canScrollTop={canScrollTop} canScrollBottom={canScrollBottom} />}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={cn(
            'bg-BG_WHITE flex min-h-0 w-full flex-1 flex-col overflow-x-hidden [scrollbar-width:thin]',
            isTaskPopoverOpen ? 'overflow-y-hidden' : 'overflow-y-auto',
          )}
        >
          {isInConversation ? (
            <CommonWrapper
              isLoading={isLoadingConversation}
              isError={chat.isErrorConversationHistory}
              refetchFunction={chat.refetchConversationHistory}
              skeletonType={SkeletonTypes.CUSTOM}
              loader={<ChatMessagesSkeleton className='px-0' />}
              className='mx-auto flex w-full max-w-[700px] flex-1 flex-col px-3'
            >
              <MessageContainer
                messages={chat.messages}
                isAnalysing={isAnalysing}
                streamingState={chat.streamingState}
                className='gap-4 px-0 [scrollbar-width:none]'
                conversationId={conversationId ?? chat.conversationId ?? ''}
                assistantAvatar={<NewPaceAvatar />}
                showTimestamp
                showFeedback
                showCopy
                alignUserRight
              />
              <div className='bg-BG_WHITE h-12 w-full' />
            </CommonWrapper>
          ) : (
            <div className='flex flex-1 items-center justify-center'>
              <div className='flex flex-col items-center gap-4'>
                <NewPaceIcons width={40} height={40} />
                <p className='f-13-400 text-GRAY_600'>Ask Pace anything</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        ref={taskStatusContainerRef}
        className='bg-BG_WHITE sticky bottom-0 z-10 mx-auto w-full max-w-[700px] px-3 pb-3'
      >
        <Button
          onClick={handleScrollToBottomClick}
          variant='ghost'
          className={cn(
            'bg-GRAY_1000 hover:bg-GRAY_950 absolute -top-10 left-1/2 z-20 h-6 w-6 -translate-x-1/2 rounded-full p-3',
            'transition-all duration-200 ease-out',
            showScrollButton ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
          )}
          aria-label='Scroll to bottom'
        >
          <ArrowDownIcon size={14} className='text-BG_WHITE p-[2px]' />
        </Button>
        <TaskStatusCounts
          messages={chat.messages}
          streamingState={chat.streamingState}
          conversationId={conversationId ?? chat.conversationId ?? ''}
          containerRef={taskStatusContainerRef}
          onOpenChange={setIsTaskPopoverOpen}
        />
      </div>
    </ChatActionsProvider>
  );
};

export default ChatConversationContent;
