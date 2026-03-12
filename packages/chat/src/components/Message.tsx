'use client';

import { cn } from '@zamp-platform/ui/utils';
import { formatChatTimestamp, formatChatTimestampTooltip, formatTimestampToUTC } from '@zamp-platform/utils';
import { FC, useMemo } from 'react';

import { ButtonBlockType } from '../types/block.types';
import { ChatMessage, SenderType } from '../types/chat.types';
import { BlockRenderer } from './BlockRenderer';
import ChatFeedback from './ChatFeedback';
import CopyMessageButton from './CopyMessageButton';
import MessageTimestamp from './MessageTimestamp';
import { SenderDetailsProps } from './SenderDetails';

export interface MessageProps extends Omit<SenderDetailsProps, 'message'> {
  message: ChatMessage;
  onAction?: (blockConfig: ButtonBlockType, payload: Record<string, string>) => void | Promise<void>;
  isLoading?: boolean;
  blockRendererClassName?: string;
  containerClassName?: string;
  conversationId?: string;
  messageId?: string;
  showTimestamp?: boolean;
  showFeedback?: boolean;
  showCopy?: boolean;
  feedbackDisabled?: boolean;
  isLastMessage?: boolean;
  alignUserRight?: boolean;
  organizationId?: string;
  streamingEnabled?: boolean;
}

export const Message: FC<MessageProps> = ({
  message,
  onAction,
  isLoading = false,
  blockRendererClassName = 'border-none shadow-none',
  containerClassName,
  conversationId,
  messageId,
  assistantAvatar,
  showTimestamp = false,
  showFeedback = false,
  showCopy = false,
  feedbackDisabled = false,
  isLastMessage = false,
  alignUserRight = false,
  organizationId,
  streamingEnabled = true,
}) => {
  const isUserMessage = message.sender_type === SenderType.USER;
  const shouldAlignRight = alignUserRight && isUserMessage;

  const formattedTimestamp = useMemo(
    () => (message.timestamp ? formatChatTimestamp(formatTimestampToUTC(message.timestamp)) : ''),
    [message.timestamp],
  );

  const tooltipTimestamp = useMemo(
    () => (message.timestamp ? formatChatTimestampTooltip(formatTimestampToUTC(message.timestamp)) : ''),
    [message.timestamp],
  );

  return (
    <div className={cn('group space-y-4', shouldAlignRight && 'flex flex-col items-end', containerClassName)}>
      {message.sender_type === SenderType.ASSISTANT && assistantAvatar}

      <BlockRenderer
        message={{ block: message?.message_content?.elements ?? [] }}
        onAction={onAction}
        className={cn(shouldAlignRight && 'bg-GRAY_100 max-w-[80%] rounded-[10px] px-4 py-3', blockRendererClassName)}
        conversationId={conversationId || message?.conversation_id}
        messageId={messageId || message?.id}
        isLoading={isLoading}
      />
      {streamingEnabled && (
        <div
          className={cn(
            'mt-3 flex items-center gap-x-1.5',
            isLastMessage ? 'visible' : 'invisible group-hover:visible',
            shouldAlignRight && 'mt-0',
          )}
        >
          {showCopy && <CopyMessageButton messageContent={message.message_content} />}
          {showTimestamp && message.sender_type === SenderType.USER && (
            <MessageTimestamp formattedTimestamp={formattedTimestamp} tooltipTimestamp={tooltipTimestamp} />
          )}
          {showFeedback && message.sender_type === SenderType.ASSISTANT && (
            <ChatFeedback
              messageId={messageId || message?.id}
              conversationId={conversationId || message?.conversation_id}
              disabled={feedbackDisabled || isLoading}
              organizationId={organizationId}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Message;
