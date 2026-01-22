'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { formatChatTimestamp, formatChatTimestampTooltip, formatTimestampToUTC } from '@zamp-platform/utils';
import { FC, useMemo } from 'react';

import { ButtonBlockType } from '../types/block.types';
import { ChatMessage, SenderType } from '../types/chat.types';
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
  showTimestamp?: boolean;
  alignUserRight?: boolean;
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
  alignUserRight = false,
  hideSenderName = false,
}) => {
  const isUserMessage = message.sender_type === SenderType.USER;
  const shouldAlignRight = alignUserRight && isUserMessage;

  console.log('shouldAlignRight', shouldAlignRight);

  const formattedTimestamp = useMemo(
    () => (message.timestamp ? formatChatTimestamp(formatTimestampToUTC(message.timestamp)) : ''),
    [message.timestamp],
  );

  const tooltipTimestamp = useMemo(
    () => (message.timestamp ? formatChatTimestampTooltip(formatTimestampToUTC(message.timestamp)) : ''),
    [message.timestamp],
  );

  return (
    <div className={cn('group space-y-2', shouldAlignRight && 'flex flex-col items-end', containerClassName)}>
      {showSenderDetails && (
        <SenderDetails
          message={message}
          assistantName={assistantName}
          assistantAvatar={assistantAvatar}
          hideSenderName={hideSenderName}
          userAvatar={userAvatar}
          className={cn(shouldAlignRight && 'flex-row-reverse', senderDetailsClassName)}
        />
      )}

      <BlockRenderer
        message={{ block: message?.message_content?.elements ?? [] }}
        onAction={onAction}
        className={cn(shouldAlignRight && 'bg-GRAY_100 max-w-[80%] rounded-[10px] px-4 py-3', blockRendererClassName)}
        conversationId={conversationId || message?.conversation_id}
        messageId={messageId || message?.id}
        isLoading={isLoading}
      />
      {showTimestamp && formattedTimestamp && (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'text-GRAY_600 f-10-450 invisible w-fit cursor-default group-hover:visible',
                  shouldAlignRight && 'text-right',
                )}
              >
                {formattedTimestamp}
              </div>
            </TooltipTrigger>
            <TooltipContent side='bottom' align='center' className='f-10-450 p-1.5' sideOffset={12}>
              <p>{tooltipTimestamp}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default Message;
