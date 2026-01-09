'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  ConnectedChatInput,
  MessageContainer,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
} from '@zamp-platform/chat';
import { cn } from '@zamp-platform/ui/utils';
import { useParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { useAppSelector } from '@/hooks/toolkit';
import NewPaceAvatar from '@/modules/chatbot/NewPaceAvatar';
import { ACCEPTED_FILE_TYPES } from '@/modules/macs';
import { ChatMessagesSkeleton } from '@/modules/macs/components/loaders';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import type { RootState } from '@/store';

const ChatIdPage = () => {
  const params = useParams();
  const chatId = params?.chatId as string;
  const { setChatTitle } = useMacsContext();
  const [isChatScrolled, setIsChatScrolled] = useState(false);

  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';

  const chat = useChat({
    resourceId: organizationId,
    resourceType: ResourceType.ORGANIZATION,
    conversationId: chatId,
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

  const isLoadingConversation =
    (chat.isLoadingConversationHistory && !hasMessages) || chat.isUninitializedConversationHistory;

  const handleScrollChange = useCallback(
    (isScrolled: boolean) => {
      setIsChatScrolled(isScrolled);
    },
    [setIsChatScrolled],
  );

  return (
    <div
      className={cn(
        'mx-auto flex h-full w-full max-w-[700px] flex-col',
        isChatScrolled ? 'border-t border-gray-200' : 'border-b border-transparent',
      )}
    >
      <CommonWrapper
        isLoading={isLoadingConversation}
        isError={chat.isErrorConversationHistory}
        refetchFunction={chat.refetchConversationHistory}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ChatMessagesSkeleton />}
        className='flex min-h-0 flex-1'
      >
        <MessageContainer
          messages={chat.messages}
          isAnalysing={isAnalysing}
          streamingState={chat.streamingState}
          className='px-3 [scrollbar-width:none]'
          assistantAvatar={<NewPaceAvatar />}
          onScrollChange={handleScrollChange}
          streamingEnabled
        />
      </CommonWrapper>
      <div className='mx-auto w-full flex-shrink-0 px-3 pb-3'>
        <ConnectedChatInput
          chat={chat}
          conversationId={chatId}
          resourceType={ResourceType.ORGANIZATION}
          resourceId={organizationId}
          scope={ScopeType.ORGANIZATION}
          scopeId={organizationId}
          organizationId={organizationId}
          currentUserName={currentUserName}
          isDisabled={chat.isStreaming}
          placeholder="Do your life's best work with Pace"
          acceptedFileTypes={ACCEPTED_FILE_TYPES}
        />
      </div>
    </div>
  );
};

export default ChatIdPage;
