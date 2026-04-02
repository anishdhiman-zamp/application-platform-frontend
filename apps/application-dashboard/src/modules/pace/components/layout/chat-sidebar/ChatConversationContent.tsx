'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChatActionsProvider,
  createConversationPayload,
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
import type { ChatState } from 'modules/pace/components/layout/chat-sidebar/ChatSidebarInner';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import NewPaceAvatar from '@/modules/chatbot/NewPaceAvatar';
import TaskStatusCounts from '@/modules/pace/components/chat/TaskStatusCounts';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { usePaceContext } from '@/modules/pace/pace.context';

export interface ChatConversationContentProps {
  conversationId: string | null;
  setConversationId: (id: string | null, title?: string) => void;
  setChatTitle: (title: string) => void;
  chatTitle: string;
  organizationId: string;
  onFileOpen: (path: string, name: string) => void;
  onTaskOpen?: (name: string, path: string) => void;
  onTaskPopoverOpenChange?: (open: boolean) => void;
  isOnChatRoute: boolean;
  onChatStateChange: (state: ChatState) => void;
  fileDropHandlerRef: React.RefObject<((files: FileList) => void) | null>;
  addFileReferenceRef: React.RefObject<((ref: { path: string; name: string }) => void) | null>;
  currentUserName: string;
}

const ChatConversationContent: FC<ChatConversationContentProps> = ({
  conversationId,
  setConversationId,
  setChatTitle,
  chatTitle,
  organizationId,
  onFileOpen,
  onTaskOpen,
  onTaskPopoverOpenChange,
  isOnChatRoute,
  onChatStateChange,
  fileDropHandlerRef,
  addFileReferenceRef,
  currentUserName,
}) => {
  const pendingPayloadConsumedRef = useRef(false);
  const { pendingFileReference, clearPendingFileReference, pendingConversationPayload, setPendingConversationPayload } =
    usePaceContext();

  const taskStatusContainerRef = useRef<HTMLDivElement>(null);

  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false);

  const handleTaskPopoverOpenChange = (open: boolean) => {
    setIsTaskPopoverOpen(open);
    onTaskPopoverOpenChange?.(open);
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
  const chatRef = useRef(chat);

  const hasMessages = useMemo(() => chat.messages.length > 0, [chat.messages]);
  const isAnalysing = useMemo(() => {
    return chat.messages.length > 0 && chat.messages[chat.messages.length - 1]?.sender_type === SenderType.USER;
  }, [chat.messages]);
  const isInConversation = Boolean(conversationId || chat.conversationId || hasMessages);
  const showHomeView = isOnChatRoute && !isInConversation;
  const lastMessageSenderType = useMemo(() => chat.messages[chat.messages.length - 1]?.sender_type, [chat.messages]);
  const isLoadingConversation =
    !hasMessages || Boolean(conversationId && chat.isLoadingConversationHistory && !hasMessages);
  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: chat.isStreaming || chat.isCreatingConversationV2,
  });

  useEffect(() => {
    if (chat.conversationId && chat.conversationId !== conversationId) {
      setConversationId(chat.conversationId, chatTitle);
    }
  }, [chat.conversationId, setConversationId, chatTitle, conversationId]);

  useEffect(() => {
    if (pendingFileReference && addFileReferenceRef.current) {
      addFileReferenceRef.current(pendingFileReference);
      clearPendingFileReference();
    }
  }, [pendingFileReference, clearPendingFileReference, addFileReferenceRef]);

  useEffect(() => {
    onChatStateChange({ chat, isInConversation, showHomeView, inputsRequired: chat.inputsRequired });
  }, [chat, isInConversation, showHomeView, onChatStateChange, chat.inputsRequired]);

  useEffect(() => {
    if (pendingConversationPayload && !pendingPayloadConsumedRef.current && !conversationId) {
      pendingPayloadConsumedRef.current = true;
      const payload = createConversationPayload(
        organizationId,
        ResourceType.ORGANIZATION,
        organizationId,
        pendingConversationPayload.message,
        currentUserName,
        pendingConversationPayload.fileReferences,
        ScopeType.ORGANIZATION,
        undefined,
        undefined,
        pendingConversationPayload.llmModel,
      );

      setPendingConversationPayload(null);
      chat.createConversationV2(payload);
    }
  }, [
    pendingConversationPayload,
    conversationId,
    organizationId,
    currentUserName,
    chat,
    setPendingConversationPayload,
  ]);

  useEffect(() => {
    chatRef.current = chat;
  });

  return (
    <ChatActionsProvider onFileOpen={onFileOpen} onTaskOpen={onTaskOpen}>
      <div className='relative flex min-h-0 w-full flex-1 flex-col overflow-hidden' {...dropZoneProps}>
        <DropOverlay isVisible={isDragOver} />
        <ScrollContainer
          showScrollToBottom
          enableAnchorScroll
          lastMessageSenderType={lastMessageSenderType}
          isLoading={isLoadingConversation}
          streamingState={chat.streamingState}
          scrollTrigger={chat.messages?.length}
          scrollClassName={cn(
            'bg-BG_WHITE transition-[filter] duration-200',
            isTaskPopoverOpen ? 'overflow-y-hidden blur-sm pointer-events-none' : 'overflow-y-scroll',
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
        </ScrollContainer>
      </div>
      <div ref={taskStatusContainerRef} className='bg-BG_WHITE sticky bottom-0 z-10 mx-auto w-full max-w-[700px] px-3'>
        <TaskStatusCounts
          messages={chat.messages}
          streamingState={chat.streamingState}
          conversationId={conversationId ?? chat.conversationId ?? ''}
          containerRef={taskStatusContainerRef}
          onOpenChange={handleTaskPopoverOpenChange}
        />
      </div>
    </ChatActionsProvider>
  );
};

export default ChatConversationContent;
