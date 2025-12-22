import type { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { MessagesSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getChatRouteById } from '@/constants/routeConfig';
import type { FeedbackItemType } from '@/types/api/feedbacks.types';

interface ChatHistoryItemProps {
  conversation: FeedbackItemType;
}

const ChatHistoryItem: FC<ChatHistoryItemProps> = ({ conversation }) => {
  const router = useRouter();

  return (
    <Button
      variant='ghost'
      onClick={() => router.push(getChatRouteById(conversation?.id))}
      className='h-auto w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2.5 hover:bg-gray-50'
    >
      <div className='flex items-center gap-2.5'>
        <MessagesSquare size={16} className='flex-shrink-0 text-gray-500' />
        <p className='f-13-500 text-gray-1000 line-clamp-1 text-left'>
          {conversation?.title || 'Untitled conversation'}
        </p>
      </div>
    </Button>
  );
};

export default ChatHistoryItem;
