'use client';

import { cn } from '@zamp-platform/ui/utils';
import React, { FC, memo, ReactNode } from 'react';

import { ChatMessage, SenderType } from '../types/chat.types';

export interface SenderDetailsProps {
  message: ChatMessage;
  assistantName?: string;
  assistantAvatar?: ReactNode;
  userAvatar?: (senderName: string) => ReactNode;
  className?: string;
}

const SenderDetails: FC<SenderDetailsProps> = ({
  message,
  assistantName = 'Assistant',
  assistantAvatar,
  userAvatar,
  className,
}) => {
  const isAssistant = message.sender_type === SenderType.ASSISTANT;
  const senderName = isAssistant ? assistantName : (message.sender_name ?? '');

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {isAssistant ? assistantAvatar : userAvatar?.(senderName)}
      <span className='f-12-550 capitalize'>{senderName}</span>
    </div>
  );
};

export default memo(SenderDetails);
