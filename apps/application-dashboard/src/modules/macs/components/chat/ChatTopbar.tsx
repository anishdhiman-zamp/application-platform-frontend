'use client';

import type { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Plus } from 'lucide-react';
import { useChatContext } from '@/modules/macs/context/ChatContext';

interface ChatTopbarProps {
  className?: string;
  style?: React.CSSProperties;
}

const ChatTopbar: FC<ChatTopbarProps> = ({ className, style }) => {
  const { chatTitle, startNewChat } = useChatContext();

  const displayTitle = chatTitle || 'Chat';

  return (
    <div
      className={cn('border-GRAY_400 flex h-10 items-center justify-between gap-x-2 border-b p-3', className)}
      style={style}
    >
      <div className='f-11-550 min-w-0 flex-1 truncate capitalize'>{displayTitle}</div>
      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 p-2 text-gray-600 hover:text-gray-900'
          onClick={startNewChat}
          title='Start new chat'
        >
          <Plus size={12} />
        </Button>
      </div>
    </div>
  );
};

export default ChatTopbar;
