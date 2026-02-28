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
import { CHAT_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { APITags } from '@/constants/api.constants';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppDispatch, useAppSelector } from '@/hooks/toolkit';
import NewPaceAvatar from '@/modules/chatbot/NewPaceAvatar';
import ChatTopbar from '@/modules/pace/components/chat/ChatTopbar';
import ModelSelector from '@/modules/pace/components/chat/ModelSelector';
import ChatMessagesSkeleton from '@/modules/pace/components/loaders/ChatMessagesSkeleton';
import { useChatDraftInput } from '@/modules/pace/hooks/useChatDraftInput';
import { useChatScroll } from '@/modules/pace/hooks/useChatScroll';
import { useDynamicTabs } from '@/modules/pace/hooks/useDynamicTabs';
import { baseApi } from '@/services/baseApi';
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
  const dispatch = useAppDispatch();
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';

  const { inputValue, setInputValue } = useChatDraftInput({ conversationId });
  const fileDropHandlerRef = useRef<((files: FileList) => void) | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const { openTab } = useDynamicTabs();

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

  useEffect(() => {
    if (chat.conversationId && chat.conversationId !== conversationId) {
      setConversationId(chat.conversationId, chatTitle);
    }
  }, [chat.conversationId, conversationId, setConversationId]);

  const { scrollContainerRef, showScrollButton, handleScroll, handleScrollToBottomClick } = useChatScroll({
    messagesLength: chat.messages?.length ?? 0,
    isLoading: isLoadingConversation,
    streamingState: chat.streamingState,
  });

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
        />
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className='relative flex min-h-0 w-full flex-1 flex-col overflow-x-hidden overflow-y-auto [scrollbar-width:thin]'
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
                  assistantAvatar={<NewPaceAvatar />}
                  showTimestamp
                  showFeedback
                  showCopy
                  alignUserRight
                  hideSenderName
                  userAvatarClassName='h-5 min-h-5 w-5 min-w-5 f-11-500 rounded-[7.5px]'
                />
                <div className='h-12 w-full bg-white' />
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
          <div className={cn('border-GRAY_400 sticky bottom-0 z-10 w-full shrink-0 border-t bg-[#fcfcfc] p-3')}>
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
              className='bg-white'
              autoFocus
              onConversationCreated={handleConversationCreated}
              fileDropHandlerRef={fileDropHandlerRef}
              llmModel={selectedModel}
              showModelSelector
              modelSelectorSlot={modelSelectorSlot}
            />
            <Button
              onClick={handleScrollToBottomClick}
              variant='ghost'
              className={cn(
                'bg-gray-1000 hover:bg-gray-1000 absolute -top-10 left-1/2 z-20 h-6 w-6 -translate-x-1/2 rounded-full p-3',
                'transition-all duration-200 ease-out',
                showScrollButton ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
              )}
              aria-label='Scroll to bottom'
            >
              <ArrowDownIcon size={14} className='p-[2px] text-white' />
            </Button>
          </div>
        </div>
      </div>
    </ChatActionsProvider>
  );
};

export default ChatSidebarInner;
