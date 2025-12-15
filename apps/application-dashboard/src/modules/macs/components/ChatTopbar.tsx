'use client';

import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Clock, Maximize2, Minus, Plus } from 'lucide-react';
import { useMacsContext } from '@/modules/macs/context/MacsContext';

interface ChatTopbarProps {
  className?: string;
  style?: React.CSSProperties;
  showExpandMinimize?: boolean;
}

const ChatTopbar = ({ className, style, showExpandMinimize = false }: ChatTopbarProps) => {
  const { chatTitle } = useMacsContext();

  const displayTitle = chatTitle || 'Chat title goes here';

  const handleNewChat = () => {
    // TODO: Implement new chat functionality
    console.log('New chat clicked');
  };

  const handleHistory = () => {
    // TODO: Implement chat history functionality
    console.log('History clicked');
  };

  const handleExpand = () => {
    // TODO: Implement expand functionality
    console.log('Expand clicked');
  };

  const handleMinimize = () => {
    // TODO: Implement minimize functionality
    console.log('Minimize clicked');
  };

  return (
    <div className={cn('flex h-12 items-center justify-between px-4', className)} style={style}>
      <div className='f-13-500 truncate text-gray-900'>{displayTitle}</div>
      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 text-gray-600 hover:text-gray-900'
          onClick={handleHistory}
          title='Chat history'
        >
          <Clock size={16} />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-7 w-7 text-gray-600 hover:text-gray-900'
          onClick={handleNewChat}
          title='New chat'
        >
          <Plus size={16} />
        </Button>
        {showExpandMinimize && (
          <>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-gray-600 hover:text-gray-900'
              onClick={handleExpand}
              title='Expand'
            >
              <Maximize2 size={16} />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-gray-600 hover:text-gray-900'
              onClick={handleMinimize}
              title='Minimize'
            >
              <Minus size={16} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatTopbar;
