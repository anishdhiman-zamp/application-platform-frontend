'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector } from '@/hooks/toolkit';
import ChatContentInner from '@/modules/macs/components/chat/ChatContentInner';
import { useChatContext } from '@/modules/macs/context/ChatContext';
import type { RootState } from '@/store';

interface ChatContentProps {
  initialConversationId: string | null;
}

const ChatContent = ({ initialConversationId }: ChatContentProps) => {
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';

  const { setChatTitle, conversationId, setConversationId, chatKey, setInitialConversationId } = useChatContext();

  const prevChatKeyRef = useRef(chatKey);
  const useInitialRef = useRef(true);

  useEffect(() => {
    if (chatKey !== prevChatKeyRef.current) {
      useInitialRef.current = false;
      prevChatKeyRef.current = chatKey;
    }
  }, [chatKey]);

  useEffect(() => {
    if (initialConversationId && useInitialRef.current) {
      setInitialConversationId(initialConversationId);
    }
  }, [initialConversationId, setInitialConversationId]);

  const activeConversationId = conversationId ?? (useInitialRef.current ? initialConversationId : null);

  return (
    <ChatContentInner
      key={chatKey}
      organizationId={organizationId}
      currentUserName={currentUserName}
      conversationId={activeConversationId}
      setConversationId={setConversationId}
      setChatTitle={setChatTitle}
    />
  );
};

export default ChatContent;
