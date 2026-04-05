'use client';

import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChatActionsProvider,
  createConversationPayload,
  DropOverlay,
  MessageContainer,
  ResourceType,
  ScopeType,
  SenderType,
  useFileDragDrop,
  useStreamingState,
} from '@zamp-platform/chat';
import { useConversationActions, useConversationState } from '@zamp-platform/conversation-stream';
import { ScrollContainer } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import NewPaceAvatar from '@/modules/chatbot/NewPaceAvatar';
import TaskStatusCounts from '@/modules/pace/components/chat/TaskStatusCounts';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { usePaceContext } from '@/modules/pace/pace.context';
import { addAutoLoopLockedConversation } from '@/modules/pace/utils/autoLoopStorage';

export interface ChatConversationContentProps {
  conversationId: string | null;
  organizationId: string;
  onFileOpen: (path: string, name: string) => void;
  onTaskOpen?: (name: string, path: string) => void;
  onBrowserOpen?: (conversationId: string) => void;
  onTaskPopoverOpenChange?: (open: boolean) => void;
  fileDropHandlerRef: React.RefObject<((files: FileList) => void) | null>;
  addFileReferenceRef: React.RefObject<((ref: { path: string; name: string }) => void) | null>;
  currentUserName: string;
}

const ChatConversationContent: FC<ChatConversationContentProps> = ({
  conversationId,
  organizationId,
  onFileOpen,
  onTaskOpen,
  onBrowserOpen,
  onTaskPopoverOpenChange,
  fileDropHandlerRef,
  addFileReferenceRef,
  currentUserName,
}) => {
  const pendingPayloadConsumedRef = useRef(false);
  const taskStatusContainerRef = useRef<HTMLDivElement>(null);

  const { pendingFileReference, clearPendingFileReference, pendingConversationPayload, setPendingConversationPayload } =
    usePaceContext();
  const {
    messages,
    conversationId: ctxConversationId,
    isCreatingConversationV2,
    isLoadingConversationHistory,
    isErrorConversationHistory,
    isStreaming,
    isBrowserStreamingAvailable,
    taskSummaries,
  } = useConversationState();
  const { createConversationV2, refetchConversationHistory } = useConversationActions();
  const streamingState = useStreamingState(conversationId ?? ctxConversationId);

  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false);

  const hasMessages = useMemo(() => messages.length > 0, [messages]);
  const isAnalysing = useMemo(() => {
    return messages.length > 0 && messages[messages.length - 1]?.sender_type === SenderType.USER;
  }, [messages]);
  const isInConversation = Boolean(conversationId || ctxConversationId || hasMessages || streamingState?.is_active);
  const lastMessageSenderType = useMemo(() => messages[messages.length - 1]?.sender_type, [messages]);
  const isLoadingConversation =
    !streamingState?.is_active &&
    (!hasMessages || Boolean(conversationId && isLoadingConversationHistory && !hasMessages));

  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: isStreaming || isCreatingConversationV2,
  });

  const handleWatchStream = useCallback(() => {
    const activeConversationId = conversationId ?? ctxConversationId;

    if (activeConversationId) {
      onBrowserOpen?.(activeConversationId);
    }
  }, [conversationId, ctxConversationId, onBrowserOpen]);

  const handleTaskPopoverOpenChange = (open: boolean) => {
    setIsTaskPopoverOpen(open);
    onTaskPopoverOpenChange?.(open);
  };

  useEffect(() => {
    if (pendingFileReference && addFileReferenceRef.current) {
      addFileReferenceRef.current(pendingFileReference);
      clearPendingFileReference();
    }
  }, [pendingFileReference, clearPendingFileReference, addFileReferenceRef]);

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
        pendingConversationPayload.autoLoopEnabled,
      );

      const shouldLockAutoLoop = pendingConversationPayload.autoLoopEnabled;

      setPendingConversationPayload(null);
      createConversationV2(payload).then((response) => {
        if (shouldLockAutoLoop && response?.conversation_id) {
          addAutoLoopLockedConversation(response.conversation_id);
        }
      });
    }
  }, [
    pendingConversationPayload,
    conversationId,
    organizationId,
    currentUserName,
    createConversationV2,
    setPendingConversationPayload,
  ]);

  return (
    <ChatActionsProvider
      onFileOpen={onFileOpen}
      onTaskOpen={onTaskOpen}
      onWatchStream={handleWatchStream}
      isBrowserStreamingAvailable={isBrowserStreamingAvailable}
      taskSummaries={taskSummaries}
    >
      <div className='relative flex min-h-0 w-full flex-1 flex-col overflow-hidden' {...dropZoneProps}>
        <DropOverlay isVisible={isDragOver} />
        <ScrollContainer
          showScrollToBottom
          enableAnchorScroll
          lastMessageSenderType={lastMessageSenderType}
          isLoading={isLoadingConversation}
          streamingState={streamingState}
          scrollTrigger={messages?.length}
          scrollClassName={cn(
            'bg-BG_WHITE transition-[filter] duration-200',
            isTaskPopoverOpen ? 'overflow-y-hidden blur-sm pointer-events-none' : 'overflow-y-scroll',
          )}
        >
          {isInConversation ? (
            <CommonWrapper
              isLoading={isLoadingConversation}
              isError={isErrorConversationHistory}
              refetchFunction={refetchConversationHistory}
              skeletonType={SkeletonTypes.CUSTOM}
              loader={<ChatMessagesSkeleton className='px-0' />}
              className='mx-auto flex w-full max-w-[700px] flex-1 flex-col px-3'
            >
              <MessageContainer
                messages={messages}
                isAnalysing={isAnalysing}
                streamingState={streamingState}
                className='gap-3 px-0 [scrollbar-width:none]'
                conversationId={conversationId ?? ctxConversationId ?? ''}
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
          messages={messages}
          streamingState={streamingState}
          conversationId={conversationId ?? ctxConversationId ?? ''}
          containerRef={taskStatusContainerRef}
          onOpenChange={handleTaskPopoverOpenChange}
        />
      </div>
    </ChatActionsProvider>
  );
};

export default ChatConversationContent;
