'use client';

import { useEffect } from 'react';
import { ConnectedChatInput, ResourceType, ScopeType, useChat } from '@zamp-platform/chat';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import ChatHistory from '@/modules/macs/components/chat/ChatHistory';
import MacsChatHome from '@/modules/macs/components/chat/MacsChatHome';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import type { RootState } from '@/store';

const ChatPage = () => {
  const router = useRouter();

  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';

  const { setChatTitle, resetToDefault } = useMacsContext();

  // Reset state when landing on new chat page
  useEffect(() => {
    resetToDefault();
  }, [resetToDefault]);

  const chat = useChat({
    resourceId: organizationId,
    resourceType: ResourceType.ORGANIZATION,
    enableStreaming: true,
    apiConfig: {
      sendMessage: API_ENDPOINTS.POST_MESSAGE_V3,
      createConversation: API_ENDPOINTS.CREATE_CONVERSATION_V3,
    },
    setHeader: (header: string) => {
      setChatTitle(header);
    },
  });

  useEffect(() => {
    if (chat.conversationId) {
      router.replace(`${ROUTES_PATH.CHAT}/${chat.conversationId}`);
    }
  }, [chat.conversationId, router]);

  return (
    <div className='mx-auto flex h-full w-full max-w-[700px] flex-col bg-white'>
      <MacsChatHome />
      <div className='mx-auto w-full flex-shrink-0 p-3'>
        <ConnectedChatInput
          chat={chat}
          conversationId={chat.conversationId ?? ''}
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
      <ChatHistory />
    </div>
  );
};

export default ChatPage;
