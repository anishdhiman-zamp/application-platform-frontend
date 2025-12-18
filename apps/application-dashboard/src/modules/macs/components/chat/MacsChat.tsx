'use client';

import { useEffect, useMemo } from 'react';
import {
  ButtonBlockType,
  ConnectedChatInput,
  MessageContainer,
  ResourceType,
  ScopeType,
  SenderType,
  useChat,
} from '@zamp-platform/chat';
import { cn } from '@zamp-platform/ui/utils';
import ChatHistoryView from 'modules/macs/components/chat/ChatHistoryView';
import { useAppSelector } from '@/hooks/toolkit';
import MacsChatHome from '@/modules/macs/components/chat/MacsChatHome';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import type { RootState } from '@/store';
interface MacsChatProps {
  className?: string;
}

const MacsChat = ({ className }: MacsChatProps) => {
  const organizationId = useAppSelector((state: RootState) => state.user.user?.orgs?.[0]?.organization_id) ?? '';
  const currentUserName = useAppSelector((state: RootState) => state.user.user?.user_name) ?? '';
  const { setHasChatMessages, setChatTitle, showHistoryView, registerClearMessages } = useMacsContext();

  const chat = useChat({
    resourceId: organizationId,
    resourceType: ResourceType.ORGANIZATION,
  });

  const isAnalysing = useMemo(() => {
    return chat.messages.length > 0 && chat.messages[chat.messages.length - 1]?.sender_type === SenderType.USER;
  }, [chat.messages]);

  const hasMessages = useMemo(() => {
    return chat.messages.length > 0;
  }, [chat.messages]);

  // Get the first user message for the chat title
  const firstUserMessage = useMemo(() => {
    const userMessage = chat.messages.find((msg) => msg.sender_type === SenderType.USER);

    if (userMessage?.message_content) {
      // Handle different message content structures
      const content = userMessage.message_content;

      if ('message' in content && typeof content.message === 'string') {
        return content.message;
      }
      if ('text' in content && typeof content.text === 'string') {
        return content.text;
      }
    }

    return null;
  }, [chat.messages]);

  // Register clearMessages function with context
  useEffect(() => {
    registerClearMessages(chat.clearMessages);
  }, [chat.clearMessages, registerClearMessages]);

  // Sync hasMessages state with context for layout to access
  useEffect(() => {
    setHasChatMessages(hasMessages);
  }, [hasMessages, setHasChatMessages]);

  // Update chat title based on first user message
  useEffect(() => {
    if (firstUserMessage) {
      // Truncate long messages for the title
      const title = firstUserMessage.length > 50 ? `${firstUserMessage.substring(0, 50)}...` : firstUserMessage;

      setChatTitle(title);
    } else {
      setChatTitle('');
    }
  }, [firstUserMessage, setChatTitle]);

  const handleAction = (blockConfig: ButtonBlockType, payload: Record<string, string>) => {
    console.log('Action triggered:', blockConfig, payload);
  };

  // Show history view when toggled
  if (showHistoryView) {
    return <ChatHistoryView className={className} />;
  }

  return (
    <div className={cn('mx-auto flex h-full w-full flex-col bg-white', className)}>
      <div className='flex h-full w-full flex-col'>
        {!hasMessages ? (
          <div className='mt-[116px] flex flex-col items-center gap-y-4 overflow-y-auto'>
            <MacsChatHome />
          </div>
        ) : (
          <div className='mx-auto flex w-full max-w-[700px] flex-1'>
            <MessageContainer messages={chat.messages} handleAction={handleAction} isAnalysing={isAnalysing} />
          </div>
        )}
        <div className='mx-auto w-full max-w-[700px] p-3'>
          <ConnectedChatInput
            chat={chat}
            resourceType={ResourceType.ORGANIZATION}
            resourceId={organizationId}
            scope={ScopeType.ORGANIZATION}
            scopeId={organizationId}
            organizationId={organizationId}
            currentUserName={currentUserName}
            isDisabled={isAnalysing}
            placeholder="Do your life's best work with Pace"
          />
        </div>
        {!hasMessages && (
          <div className='flex w-full items-center justify-center'>
            <ChatHistoryView />
          </div>
        )}
      </div>
    </div>
  );
};

export default MacsChat;
