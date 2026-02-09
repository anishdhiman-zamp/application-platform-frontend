'use client';

import { useEffect } from 'react';
import ChatContentInner from '@/modules/pace/components/chat/ChatContentInner';
import { useChatContentState } from '@/modules/pace/hooks/useChatContentState';
import { usePaceContext } from '@/modules/pace/pace.context';

interface ChatContentProps {
  initialConversationId: string | null;
}

const ChatContent = ({ initialConversationId }: ChatContentProps) => {
  const { registerStartNewChat } = usePaceContext();
  const {
    organizationId,
    currentUserName,
    chatTitle,
    setChatTitle,
    conversationId,
    setConversationId,
    chatKey,
    startNewChat,
  } = useChatContentState({ initialConversationId });

  useEffect(() => {
    registerStartNewChat(startNewChat);
  }, [registerStartNewChat, startNewChat]);

  return (
    <ChatContentInner
      key={chatKey}
      organizationId={organizationId}
      currentUserName={currentUserName}
      conversationId={conversationId}
      setConversationId={setConversationId}
      setChatTitle={setChatTitle}
      chatTitle={chatTitle}
      startNewChat={startNewChat}
    />
  );
};

export default ChatContent;
