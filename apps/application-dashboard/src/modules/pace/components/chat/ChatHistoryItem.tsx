'use client';

import type { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { Loader, MessagesSquare } from 'lucide-react';
import type { FeedbackItemType } from '@/types/api/feedbacks.types';

interface ChatHistoryItemProps {
  conversation: FeedbackItemType;
  onSelect: (id: string | null, title?: string) => void;
  isStreaming?: boolean;
}

const ChatHistoryItem: FC<ChatHistoryItemProps> = ({ conversation, onSelect, isStreaming }) => {
  const handleClick = () => {
    onSelect(conversation?.id, conversation?.title);
  };

  return (
    <Button
      variant='ghost'
      onClick={handleClick}
      className='flex h-auto w-full cursor-pointer items-center justify-start gap-2.5 rounded-lg px-3 py-2.5'
    >
      <MessagesSquare size={16} className='shrink-0 text-gray-500' />
      <p className='f-13-500 text-gray-1000 line-clamp-1 text-left first-letter:uppercase'>
        {conversation?.title || 'Untitled conversation'}
      </p>
      {isStreaming && <Loader size={14} className='ml-auto shrink-0 animate-spin text-gray-500' />}
    </Button>
  );
};

export default ChatHistoryItem;
