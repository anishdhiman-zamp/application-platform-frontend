'use client';

import { cn } from '@zamp-platform/ui/utils';
import { FC, ReactNode, useMemo } from 'react';

import { ChatMessage, ChatMessageType, ResourceType, SenderType, StreamingState } from '../types/chat.types';
import { BlockRenderer } from './BlockRenderer';
import SenderDetails from './SenderDetails';

export interface StreamingMessageProps {
  streamingState: StreamingState;
  assistantName?: string;
  assistantAvatar?: ReactNode;
  className?: string;
  thinkingLabel?: string;
  toolUseLabel?: string;
}

/**
 * StreamingMessage component renders the streaming state from agent_streams SSE events.
 * It displays thinking, text, and tool_use content blocks as they stream in.
 */
export const StreamingMessage: FC<StreamingMessageProps> = ({
  streamingState,
  assistantName = 'Assistant',
  assistantAvatar,
  className,
}) => {
  // Create a minimal assistant message for SenderDetails
  const assistantMessage = useMemo<ChatMessage>(
    () => ({
      resource_type: ResourceType.ORGANIZATION,
      resource_id: '',
      message_content: {},
      message_type: ChatMessageType.TEXT,
      sender_type: SenderType.ASSISTANT,
      metadata: {},
      timestamp: new Date().toISOString(),
    }),
    [],
  );

  const messageElements = streamingState?.message_content?.elements || [];

  if (!streamingState || messageElements.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      <SenderDetails message={assistantMessage} assistantName={assistantName} assistantAvatar={assistantAvatar} />
      <BlockRenderer
        message={{ block: messageElements }}
        className='border-none shadow-none'
        conversationId={streamingState?.conversation_id}
        messageId={streamingState?.id}
        isLoading={false}
      />
    </div>
  );
};
