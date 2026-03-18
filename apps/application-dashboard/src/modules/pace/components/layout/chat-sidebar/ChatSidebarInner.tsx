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
import { ScrollContainer } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { useDynamicTabs } from 'modules/pace/components/dynamic-tabs/useDynamicTabs';
import { CHAT_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { useRouter } from 'next/navigation';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import NewPaceAvatar from '@/modules/chatbot/NewPaceAvatar';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import ModelSelector from '@/modules/pace/components/chat/ModelSelector';
import TaskStatusCounts from '@/modules/pace/components/chat/TaskStatusCounts';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { useChatDraftInput } from '@/modules/pace/hooks/useChatDraftInput';
import { usePaceContext } from '@/modules/pace/pace.context';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import type { RootState } from '@/store';

interface ChatSidebarInnerProps {
  conversationId: string | null;
  setConversationId: (id: string | null, title?: string) => void;
  setChatTitle: (title: string) => void;
  startNewChat: () => void;
  handleClose: () => void;
  chatTitle: string;
}

const ChatSidebarInner: FC<ChatSidebarInnerProps> = ({
  conversationId,
  setConversationId,
  setChatTitle,
  startNewChat,
  handleClose,
  chatTitle,
}) => {
  const router = useRouter();
  const { openTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';

  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);
  const addFileReferenceRef = useRef<((ref: { path: string; name: string }) => void) | null>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [isTaskPopoverOpen, setIsTaskPopoverOpen] = useState(false);
  const { inputValue, setInputValue } = useChatDraftInput({ conversationId });
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const { pendingFileReference, clearPendingFileReference } = usePaceContext();

  const handleFileOpen = useCallback(
    (path: string, name: string) => {
      openTab(path, name);
    },
    [openTab],
  );

  const modelSelectorSlot = useMemo(
    () => <ModelSelector value={selectedModel} onChange={setSelectedModel} />,
    [selectedModel],
  );

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

  const { isDragOver, dropZoneProps } = useFileDragDrop({
    onFileDrop: (files) => fileDropHandlerRef.current?.(files),
    disabled: chat.isStreaming || chat.isCreatingConversationV2,
  });

  const handleExpand = useCallback(() => {
    const chatUrl = conversationId
      ? `${ROUTES_PATH.CHAT}?${CHAT_CONVERSATION_ID_PARAM}=${conversationId}`
      : ROUTES_PATH.CHAT;

    router.push(chatUrl);
    handleClose();
  }, [conversationId, router, handleClose]);

  useEffect(() => {
    if (chat.conversationId && chat.conversationId !== conversationId) {
      setConversationId(chat.conversationId, chatTitle);
    }
  }, [chat.conversationId, conversationId, setConversationId, chatTitle]);

  useEffect(() => {
    if (pendingFileReference && addFileReferenceRef.current) {
      addFileReferenceRef.current(pendingFileReference);
      clearPendingFileReference();
    }
  }, [pendingFileReference, clearPendingFileReference, addFileReferenceRef]);

  return (
    <ChatActionsProvider onFileOpen={handleFileOpen}>
      <div className='relative flex h-full flex-1 flex-col' {...dropZoneProps}>
        <DropOverlay isVisible={isDragOver} />
        <ChatTopbar
          onStartNewChat={startNewChat}
          onClose={handleClose}
          onExpand={handleExpand}
          conversationId={conversationId}
          organizationId={organizationId}
          title={isInConversation ? chatTitle : 'New chat'}
          onTitleChange={setChatTitle}
          onDeleteConversation={startNewChat}
        />
        <ScrollContainer
          showScrollToBottom
          autoScrollToBottom
          scrollTrigger={chat.messages?.length}
          disableFadeOverlay={isTaskPopoverOpen}
          scrollbarStyle='none'
          scrollClassName={cn(
            'bg-BG_WHITE overscroll-y-contain',
            isTaskPopoverOpen ? 'overflow-y-hidden' : 'overflow-y-auto',
          )}
        >
          {isInConversation ? (
            <>
              <CommonWrapper
                isLoading={isLoadingConversation}
                isError={chat.isErrorConversationHistory}
                refetchFunction={chat.refetchConversationHistory}
                skeletonType={SkeletonTypes.CUSTOM}
                loader={<ChatMessagesSkeleton className='px-0' />}
                className='mx-auto flex w-full flex-1 flex-col px-4'
                disableAnimation
              >
                <MessageContainer
                  messages={chat.messages}
                  isAnalysing={isAnalysing}
                  streamingState={chat.streamingState}
                  className='gap-4 px-0 [scrollbar-width:none]'
                  conversationId={conversationId ?? chat?.conversationId ?? ''}
                  assistantAvatar={<NewPaceAvatar />}
                  showTimestamp
                  showFeedback
                  showCopy
                  alignUserRight
                />
                <div className='bg-BG_WHITE h-12 w-full' />
              </CommonWrapper>
            </>
          ) : (
            <div className='flex flex-1 items-center justify-center'>
              <div className='flex flex-col items-center gap-4'>
                <NewPaceIcons width={40} height={40} />
                <p className='f-13-400 text-GRAY_600'>Ask Pace anything</p>
              </div>
            </div>
          )}
        </ScrollContainer>
        <div ref={inputContainerRef} className={cn('bg-BG_WHITE sticky bottom-0 z-10 w-full shrink-0 p-3')}>
          <TaskStatusCounts
            messages={chat.messages}
            streamingState={chat.streamingState}
            conversationId={conversationId ?? chat.conversationId ?? ''}
            containerRef={inputContainerRef}
            onOpenChange={setIsTaskPopoverOpen}
          />
          <ConnectedChatInput
            chat={chat}
            conversationId={chat.conversationId ?? ''}
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
            className='bg-BG_WHITE'
            autoFocus
            fileDropHandlerRef={fileDropHandlerRef}
            addFileReferenceRef={addFileReferenceRef}
            llmModel={selectedModel}
            showModelSelector
            modelSelectorSlot={modelSelectorSlot}
          />
        </div>
      </div>
    </ChatActionsProvider>
  );
};

export default ChatSidebarInner;
