import type { FC } from 'react';
import { MessagesSquare } from 'lucide-react';
import Link from 'next/link';
import { getChatRouteById } from '@/constants/routeConfig';
import type { FeedbackItemType } from '@/types/api/feedbacks.types';

interface ChatHistoryItemProps {
  conversation: FeedbackItemType;
}

const ChatHistoryItem: FC<ChatHistoryItemProps> = ({ conversation }) => {
  return (
    <Link
      href={getChatRouteById(conversation?.id)}
      className='flex h-auto w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 hover:bg-gray-50'
    >
      <div className='flex items-center gap-2.5'>
        <MessagesSquare size={16} className='flex-shrink-0 text-gray-500' />
        <p className='f-13-500 text-gray-1000 line-clamp-1 text-left capitalize'>
          {conversation?.title || 'Untitled conversation'}
        </p>
      </div>
    </Link>
  );
};

export default ChatHistoryItem;
