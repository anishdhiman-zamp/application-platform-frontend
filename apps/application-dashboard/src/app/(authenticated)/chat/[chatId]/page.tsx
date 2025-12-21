'use client';

import { useMemo } from 'react';
import {
  ConnectedChatInput,
  MessageContainer,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
} from '@zamp-platform/chat';
import { useChatSync } from 'modules/macs/hooks/useChatSync';
import { useParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useAppSelector } from '@/hooks/toolkit';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import type { RootState } from '@/store';

const ChatIdPage = () => {
  const params = useParams();
  const chatId = params?.chatId as string;
  const { setChatTitle } = useMacsContext();

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

  const { hasMessages } = useChatSync({
    messages: chat.messages,
  });

  const isAnalysing = useMemo(() => {
    return chat.messages.length > 0 && chat.messages[chat.messages.length - 1]?.sender_type === SenderType.USER;
  }, [chat.messages]);

  const isLoadingConversation = chat.isLoadingConversationHistory && !hasMessages;

  return (
    <div className='mx-auto flex h-full w-full max-w-[700px] flex-col'>
      <CommonWrapper
        isLoading={isLoadingConversation}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />}
        className='flex min-h-0 flex-1'
      >
        <MessageContainer
          messages={chat.messages}
          isAnalysing={isAnalysing}
          streamingState={chat.streamingState}
          className='[scrollbar-width:none]'
        />
      </CommonWrapper>
      <div className='mx-auto w-full flex-shrink-0 p-3'>
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
        />
      </div>
    </div>
  );
};

export default ChatIdPage;
