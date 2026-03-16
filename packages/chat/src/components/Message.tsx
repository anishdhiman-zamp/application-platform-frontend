'use client';

import { cn } from '@zamp-platform/ui/utils';
import { formatChatTimestamp, formatChatTimestampTooltip, formatTimestampToUTC } from '@zamp-platform/utils';
import { motion } from 'motion/react';
import { FC, ReactNode, useMemo } from 'react';

import { ButtonBlockType } from '../types/block.types';
import { ChatMessage, SenderType } from '../types/chat.types';
import { BlockRenderer } from './BlockRenderer';
import ChatFeedback from './ChatFeedback';
import CopyMessageButton from './CopyMessageButton';
import MessageTimestamp from './MessageTimestamp';

export interface MessageProps {
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
  /** Whether to play the entrance animation (controlled by parent to avoid re-triggering on remount) */
  shouldAnimate?: boolean;
  alignUserRight?: boolean;
  organizationId?: string;
  streamingEnabled?: boolean;
  assistantAvatar?: ReactNode;
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
  shouldAnimate = false,
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

  const Component = shouldAnimate ? motion.div : 'div';

  return (
    <Component
      data-sender-type={message.sender_type}
      className={cn('group space-y-3', shouldAlignRight && 'flex flex-col items-end', containerClassName)}
      {...(shouldAnimate && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3, ease: 'easeOut', delay: 0.3 },
      })}
    >
      {message.sender_type === SenderType.ASSISTANT && assistantAvatar}

      <BlockRenderer
        message={{ block: message?.message_content?.elements ?? [] }}
        onAction={onAction}
        className={cn(
          'max-w-[620px]',
          shouldAlignRight && 'bg-GRAY_100 max-w-[80%] rounded-[10px] px-4 py-3',
          blockRendererClassName,
        )}
        conversationId={conversationId || message?.conversation_id}
        messageId={messageId || message?.id}
        isLoading={isLoading}
      />
      {streamingEnabled && (
        <div
          className={cn(
            'flex items-center',
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
    </Component>
  );
};

export default Message;
