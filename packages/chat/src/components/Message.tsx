'use client';

import { cn } from '@zamp-platform/ui/utils';
import { formatChatTimestamp, formatChatTimestampTooltip } from '@zamp-platform/utils';
import { FC, useMemo } from 'react';

import { ButtonBlockType } from '../types/block.types';
import { ChatMessage, SenderType } from '../types/chat.types';
import { BlockRenderer } from './BlockRenderer';
import ChatFeedback, { FeedbackData } from './ChatFeedback';
import CopyMessageButton from './CopyMessageButton';
import MessageTimestamp from './MessageTimestamp';
import SenderDetails, { SenderDetailsProps } from './SenderDetails';

export interface MessageProps extends Omit<SenderDetailsProps, 'message'> {
  message: ChatMessage;
  onAction?: (blockConfig: ButtonBlockType, payload: Record<string, string>) => void | Promise<void>;
  isLoading?: boolean;
  blockRendererClassName?: string;
  containerClassName?: string;
  conversationId?: string;
  messageId?: string;
  senderDetailsClassName?: string;
  showSenderDetails?: boolean;
  showTimestamp?: boolean;
  showFeedback?: boolean;
  showCopy?: boolean;
  onFeedbackSubmit?: (data: FeedbackData) => Promise<void> | void;
  feedbackDisabled?: boolean;
  isLastMessage?: boolean;
}

export const Message: FC<MessageProps> = ({
  message,
  onAction,
  isLoading = false,
  blockRendererClassName = 'border-none shadow-none',
  containerClassName,
  conversationId,
  messageId,
  assistantName,
  assistantAvatar,
  userAvatar,
  senderDetailsClassName,
  showSenderDetails = true,
  showTimestamp = false,
  showFeedback = false,
  showCopy = false,
  feedbackDisabled = false,
  isLastMessage = false,
}) => {
  const formattedTimestamp = useMemo(
    () => (message.timestamp ? formatChatTimestamp(message.timestamp) : ''),
    [message.timestamp],
  );

  const tooltipTimestamp = useMemo(
    () => (message.timestamp ? formatChatTimestampTooltip(message.timestamp) : ''),
    [message.timestamp],
  );

  return (
    <div className={cn('group space-y-2', containerClassName)}>
      {showSenderDetails && (
        <SenderDetails
          message={message}
          assistantName={assistantName}
          assistantAvatar={assistantAvatar}
          userAvatar={userAvatar}
          className={senderDetailsClassName}
        />
      )}

      <BlockRenderer
        message={{ block: message?.message_content?.elements ?? [] }}
        onAction={onAction}
        className={blockRendererClassName}
        conversationId={conversationId || message?.conversation_id}
        messageId={messageId || message?.id}
        isLoading={isLoading}
      />
      <div
        className={cn('mt-3 flex items-center gap-x-1', isLastMessage ? 'visible' : 'invisible group-hover:visible')}
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
          />
        )}
      </div>
    </div>
  );
};

export default Message;
