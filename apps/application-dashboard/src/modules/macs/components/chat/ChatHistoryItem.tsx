'use client';

import type { FC } from 'react';
import { MessagesSquare } from 'lucide-react';
import { useChatContext } from '@/modules/macs/context/ChatContext';
import type { FeedbackItemType } from '@/types/api/feedbacks.types';

interface ChatHistoryItemProps {
  conversation: FeedbackItemType;
}

const ChatHistoryItem: FC<ChatHistoryItemProps> = ({ conversation }) => {
  const { setConversationId } = useChatContext();

  const handleClick = () => {
    setConversationId(conversation?.id);
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      className='flex h-auto w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 hover:bg-gray-50'
    >
      <div className='flex items-center gap-2.5'>
        <MessagesSquare size={16} className='flex-shrink-0 text-gray-500' />
        <p className='f-13-500 text-gray-1000 line-clamp-1 text-left capitalize'>
          {conversation?.title || 'Untitled conversation'}
        </p>
      </div>
    </button>
  );
};

export default ChatHistoryItem;
