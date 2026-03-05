'use client';

import { useEffect, useMemo, useState } from 'react';
import ChatContentInner from '@/modules/pace/components/chat/ChatContentInner';
import ModelSelector from '@/modules/pace/components/chat/ModelSelector';
import { useChatContentState } from '@/modules/pace/hooks/useChatContentState';
import { usePaceContext } from '@/modules/pace/pace.context';

interface ChatContentProps {
  initialConversationId: string | null;
}

const ChatContent = ({ initialConversationId }: ChatContentProps) => {
  const { registerStartNewChat } = usePaceContext();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const {
    organizationId,
    username,
    chatTitle,
    setChatTitle,
    conversationId,
    setConversationId,
    chatKey,
    startNewChat,
  } = useChatContentState({ initialConversationId });

  const modelSelectorSlot = useMemo(
    () => <ModelSelector value={selectedModel} onChange={setSelectedModel} />,
    [selectedModel],
  );

  useEffect(() => {
    registerStartNewChat(startNewChat);
  }, [registerStartNewChat, startNewChat]);

  return (
    <ChatContentInner
      key={chatKey}
      organizationId={organizationId}
      username={username}
      conversationId={conversationId}
      setConversationId={setConversationId}
      setChatTitle={setChatTitle}
      chatTitle={chatTitle}
      startNewChat={startNewChat}
      selectedModel={selectedModel}
      modelSelectorSlot={modelSelectorSlot}
    />
  );
};

export default ChatContent;
