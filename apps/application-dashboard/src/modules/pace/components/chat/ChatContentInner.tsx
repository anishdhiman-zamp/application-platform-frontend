'use client';

import { useCallback, useEffect, useMemo } from 'react';
import {
  ConnectedChatInput,
  MessageContainer,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
} from '@zamp-platform/chat';
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

  const handleConversationCreated = useCallback(() => {
    dispatch(baseApi.util.invalidateTags([APITags.GET_CONVERSATION_HISTORY]));
  }, [dispatch]);

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

  useEffect(() => {
    if (chat.conversationId && !conversationId) {
      setConversationId(chat.conversationId);
    }
  }, [chat.conversationId, conversationId, setConversationId]);

  if (isInConversation) {
    return (
      <>
        <ChatTopbar title={chatTitle || 'Untitled'} onStartNewChat={startNewChat} />
        <div className='mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col overflow-hidden'>
          <CommonWrapper
            isLoading={isLoadingConversation}
            isError={chat.isErrorConversationHistory}
            refetchFunction={chat.refetchConversationHistory}
            skeletonType={SkeletonTypes.CUSTOM}
            loader={<ChatMessagesSkeleton className='p-0' />}
            className='flex min-h-0 flex-1'
          >
            <MessageContainer
              messages={chat.messages}
              isAnalysing={isAnalysing}
              streamingState={chat.streamingState}
              className='px-3 [scrollbar-width:none]'
              assistantAvatar={<NewPaceAvatar />}
              streamingEnabled
            />
          </CommonWrapper>
          <div className='mx-auto w-full flex-shrink-0 px-3 pb-3'>
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
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <div className='mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col overflow-hidden'>
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
        />
      </div>
      <ChatHistory onSelectConversation={setConversationId} />
    </div>
  );
};

export default ChatContentInner;
