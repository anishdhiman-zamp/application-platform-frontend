'use client';

import { cn } from '@zamp-platform/ui/utils';
import { FC } from 'react';

import { ButtonBlockType } from '../types/block.types';
import { ChatMessage } from '../types/chat.types';
import { BlockRenderer } from './BlockRenderer';
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
}) => {
  return (
    <div className={cn('space-y-2', containerClassName)}>
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
    </div>
  );
};

export default Message;
