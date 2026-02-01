'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { FC, memo, ReactNode } from 'react';

import { ChatMessage, SenderType } from '../types/chat.types';

export interface SenderDetailsProps {
  message: ChatMessage;
  assistantName?: string;
  assistantAvatar?: ReactNode;
  userAvatar?: (senderName: string) => ReactNode;
  className?: string;
  hideSenderName?: boolean;
}

const SenderDetails: FC<SenderDetailsProps> = ({
  message,
  assistantName = 'Assistant',
  assistantAvatar,
  userAvatar,
  className,
  hideSenderName = false,
}) => {
  const isAssistant = message.sender_type === SenderType.ASSISTANT;
  const senderName = isAssistant ? assistantName : (message.sender_name ?? '');
  const avatarElement = isAssistant ? assistantAvatar : userAvatar?.(senderName);

  return (
    <div className={cn('flex items-center gap-x-1.5', className)}>
      {hideSenderName ? (
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='cursor-default'>{avatarElement}</div>
            </TooltipTrigger>
            <TooltipContent side='bottom' align='center' className='f-10-450 p-1.5' sideOffset={4}>
              <p className='capitalize'>{senderName}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <>
          {avatarElement}
          <span className='f-12-550 capitalize'>{senderName}</span>
        </>
      )}
    </div>
  );
};

export default memo(SenderDetails);
