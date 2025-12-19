'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ConnectedChatInput,
  MessageContainer,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
} from '@zamp-platform/chat';
import { cn } from '@zamp-platform/ui/utils';
import ChatHistoryView from 'modules/macs/components/chat/ChatHistoryView';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import ImageLoader from '@/components/common/loader/ImageLoader';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import MacsChatHome from '@/modules/macs/components/chat/MacsChatHome';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { useChatSync } from '@/modules/macs/hooks/useChatSync';
import type { RootState } from '@/store';

interface MacsChatProps {
  className?: string;
}

const MacsChat = ({ className }: MacsChatProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationIdFromParam = searchParams?.get('conversationId') ?? null;

  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';

  const { showHistoryView, isNewChat, setIsNewChat } = useMacsContext();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const chat = useChat({
    resourceId: organizationId,
    resourceType: ResourceType.ORGANIZATION,
    conversationId: selectedConversationId ?? conversationIdFromParam ?? undefined,
    refetchConversationHistory: true,
    enableStreaming: true,
    apiConfig: {
      sendMessage: API_ENDPOINTS.POST_MESSAGE_V3,
      createConversation: API_ENDPOINTS.CREATE_CONVERSATION_V3,
    },
  });

  const { hasMessages } = useChatSync({
    messages: chat.messages,
    clearMessages: chat.clearMessages,
  });

  const isAnalysing = useMemo(() => {
    if (chat.streamingState) return false;

    return chat.messages.length > 0 && chat.messages[chat.messages.length - 1]?.sender_type === SenderType.USER;
  }, [chat.messages, chat.streamingState]);

  const isInputDisabled = useMemo(() => {
    return chat.isStreaming;
  }, [chat.isStreaming]);

  const isLoadingConversation =
    chat.isLoadingConversationHistory ||
    (!isNewChat && (!!conversationIdFromParam || !!selectedConversationId) && !hasMessages);

  useEffect(() => {
    if (isNewChat) {
      router.replace(ROUTES_PATH.MACS);
    }
  }, [isNewChat, router]);

  useEffect(() => {
    if (isNewChat && !conversationIdFromParam && !selectedConversationId) {
      setIsNewChat(false);
    }
  }, [isNewChat, conversationIdFromParam, selectedConversationId, setIsNewChat]);

  useEffect(() => {
    if (!isNewChat && chat.conversationId && !conversationIdFromParam && !selectedConversationId) {
      router.replace(`${ROUTES_PATH.MACS}?conversationId=${chat.conversationId}`);
    }
  }, [isNewChat, chat.conversationId, conversationIdFromParam, selectedConversationId, router]);

  if (showHistoryView) {
    return (
      <ChatHistoryView
        className='h-full max-w-[700px]'
        onConversationClick={(conversationId) => setSelectedConversationId(conversationId)}
      />
    );
  }

  return (
    <CommonWrapper
      isLoading={isLoadingConversation}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />}
      className={cn('mx-auto flex h-full w-full max-w-[700px] flex-col bg-white', className)}
    >
      {!hasMessages ? (
        <MacsChatHome />
      ) : (
        <MessageContainer
          messages={chat.messages}
          isAnalysing={isAnalysing}
          streamingState={chat.streamingState}
          className='[scrollbar-width:none]'
        />
      )}
      <div className='mx-auto w-full flex-shrink-0 p-3'>
        <ConnectedChatInput
          chat={chat}
          conversationId={selectedConversationId ?? conversationIdFromParam ?? undefined}
          resourceType={ResourceType.ORGANIZATION}
          resourceId={organizationId}
          scope={ScopeType.ORGANIZATION}
          scopeId={organizationId}
          organizationId={organizationId}
          currentUserName={currentUserName}
          isDisabled={isInputDisabled}
          placeholder="Do your life's best work with Pace"
        />
      </div>
      {!hasMessages && (
        <ChatHistoryView onConversationClick={(conversationId) => setSelectedConversationId(conversationId)} />
      )}
    </CommonWrapper>
  );
};

export default MacsChat;
