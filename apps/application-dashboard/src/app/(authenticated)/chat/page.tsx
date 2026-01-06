'use client';

import { useEffect } from 'react';
import { ConnectedChatInput, ResourceType, ScopeType, useChat } from '@zamp-platform/chat';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/apis/apiEndpoint.constants';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import ChatHistory from '@/modules/macs/components/chat/ChatHistory';
import ChatHome from '@/modules/macs/components/chat/ChatHome';
import MacsTopbar from '@/modules/macs/components/MacsTopbar';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { ViewMode } from '@/modules/macs/types';
import type { RootState } from '@/store';

const ChatPage = () => {
  const router = useRouter();

  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';

  const { setChatTitle, resetToDefault, viewMode } = useMacsContext();

  const isDefaultView = viewMode === ViewMode.Default;

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
      router.push(`${ROUTES_PATH.CHAT}/${chat.conversationId}`);
    }
  }, [chat.conversationId, router]);

  useEffect(() => {
    resetToDefault();
  }, [resetToDefault]);

  return (
    <div className='flex h-full w-full flex-col'>
      {isDefaultView && <MacsTopbar />}
      <div className='mx-auto flex min-h-0 w-full max-w-[700px] flex-1 flex-col bg-white'>
        <ChatHome />
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
            isDisabled={chat.isStreaming || chat.isCreatingConversationV2}
            placeholder="Do your life's best work with Pace"
            className={chat.isCreatingConversationV2 ? 'animate-pulse rounded-xl bg-gray-50' : ''}
            disableAttachments
          />
        </div>
        <ChatHistory />
      </div>
    </div>
  );
};

export default ChatPage;
