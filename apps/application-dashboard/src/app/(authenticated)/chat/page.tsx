'use client';

import { CHAT_CONVERSATION_ID_PARAM } from 'modules/pace/pace.constants';
import { useSearchParams } from 'next/navigation';
import ChatContent from '@/modules/pace/components/chat/ChatContent';

const ChatPage = () => {
  const searchParams = useSearchParams();
  const conversationId = searchParams?.get(CHAT_CONVERSATION_ID_PARAM) ?? null;

  return <ChatContent initialConversationId={conversationId} />;
};

export default ChatPage;
