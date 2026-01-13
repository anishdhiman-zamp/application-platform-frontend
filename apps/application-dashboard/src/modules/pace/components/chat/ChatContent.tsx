'use client';

import ChatContentInner from '@/modules/pace/components/chat/ChatContentInner';
import { useChatContentState } from '@/modules/pace/hooks/useChatContentState';

interface ChatContentProps {
  initialConversationId: string | null;
}

const ChatContent = ({ initialConversationId }: ChatContentProps) => {
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
