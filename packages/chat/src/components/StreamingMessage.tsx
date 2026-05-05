'use client';

import { cn } from '@zamp-platform/ui/utils';
import { FC, ReactNode } from 'react';

import { StreamingState } from '../types/chat.types';
import { BlockRenderer } from './BlockRenderer';

export interface StreamingMessageProps {
  streamingState: StreamingState;
  assistantAvatar?: ReactNode;
  className?: string;
  thinkingLabel?: string;
  toolUseLabel?: string;
  showMarkdownConnectors?: boolean;
  showConnectorToLastBlock?: boolean;
  showConnectorToNextBlock?: boolean;
}

/**
 * StreamingMessage component renders the streaming state from agent_streams SSE events.
 * It displays thinking, text, and tool_use content blocks as they stream in.
 */
export const StreamingMessage: FC<StreamingMessageProps> = ({
  streamingState,
  assistantAvatar,
  className,
  showMarkdownConnectors = false,
  showConnectorToLastBlock = false,
}) => {
  const messageElements = streamingState?.message_content?.elements || [];

  if (!streamingState || messageElements.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <BlockRenderer
        message={{ block: messageElements }}
        className='border-none shadow-none'
        conversationId={streamingState?.conversation_id}
        messageId={streamingState?.id}
        isLoading={false}
        isStreaming
        showMarkdownConnectors={showMarkdownConnectors}
        showConnectorToLastBlock={showConnectorToLastBlock}
      />
      {assistantAvatar}
    </div>
  );
};
