import ChatContent from '@/modules/pace/components/chat/ChatContent';

interface ChatPageProps {
  searchParams: Promise<{ c?: string }>;
}

const ChatPage = async ({ searchParams }: ChatPageProps) => {
  const params = await searchParams;
  const conversationId = params.c ?? null;

  return <ChatContent initialConversationId={conversationId} />;
};

export default ChatPage;
