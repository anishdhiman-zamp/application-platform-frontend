'use client';

import { useCallback } from 'react';
import { ResourceType } from '@zamp-platform/chat';
import { ConversationProvider } from '@zamp-platform/conversation-stream';
import ChatSidebarContent from 'modules/pace/components/layout/chat-sidebar/ChatSidebarContent';
import { useAppSelector } from '@/hooks/toolkit';
import type { RootState } from '@/store';

interface ChatSidebarInnerProps {
  conversationId: string | null;
  setConversationId: (id: string | null, title?: string) => void;
  setChatTitle: (title: string) => void;
  startNewChat: () => void;
  chatTitle: string;
  chatKey: number;
}

const ChatSidebarInner = ({
  conversationId,
  setConversationId,
  setChatTitle,
  startNewChat,
  chatTitle,
  chatKey,
}: ChatSidebarInnerProps) => {
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const username = useAppSelector((state: RootState) => state.user.user?.username) ?? '';

  const handleConversationIdChange = useCallback(
    (id: string | null) => {
      if (id && id !== conversationId) {
        setConversationId(id, chatTitle);
      }
    },
    [setConversationId, chatTitle, conversationId],
  );

  return (
    <ConversationProvider
      key={chatKey}
      conversationId={conversationId}
      resourceId={organizationId}
      resourceType={ResourceType.ORGANIZATION}
      enableStreaming
      usePerConversationSSE
      setHeader={(header: string) => {
        if (!chatTitle) {
          setChatTitle(header);
        }
      }}
      onConversationIdChange={handleConversationIdChange}
    >
      <ChatSidebarContent
        conversationId={conversationId}
        setConversationId={setConversationId}
        setChatTitle={setChatTitle}
        startNewChat={startNewChat}
        chatTitle={chatTitle}
        chatKey={chatKey}
        organizationId={organizationId}
        currentUserName={currentUserName}
        username={username}
      />
    </ConversationProvider>
  );
};

export default ChatSidebarInner;
