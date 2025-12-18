'use client';

import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowLeft, Clock, Maximize2, Minus, PanelLeftClose, Plus } from 'lucide-react';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { ViewMode } from '@/modules/macs/types';

interface ChatTopbarProps {
  className?: string;
  style?: React.CSSProperties;
  showExpandMinimize?: boolean;
}

const ChatTopbar = ({ className, style, showExpandMinimize = false }: ChatTopbarProps) => {
  const {
    chatTitle,
    setViewMode,
    openSplitViewWithMenu,
    resetToDefault,
    setShowHistoryView,
    startNewChat,
    showHistoryView,
  } = useMacsContext();

  const displayTitle = chatTitle || 'Chat';

  const handleNewChat = () => {
    startNewChat();
  };

  const handleHistory = () => {
    setShowHistoryView(true);
  };

  const handlePanelLeftClose = () => {
    openSplitViewWithMenu();
  };

  const handleExpand = () => {
    resetToDefault();
  };

  const handleMinimize = () => {
    setViewMode(ViewMode.SectionExpanded);
  };

  return (
    <div className={cn('flex h-8 items-center justify-between px-3', className)} style={style}>
      <div className='flex items-center gap-x-3'>
        {showHistoryView ? (
          <div className='flex items-center gap-x-3 text-gray-700'>
            <ArrowLeft size={12} onClick={() => setShowHistoryView(false)} className='cursor-pointer' />
            <span className='f-11-450'>Back to chat</span>
          </div>
        ) : (
          <>
            {!showExpandMinimize && (
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 text-gray-600 hover:text-gray-900'
                onClick={handlePanelLeftClose}
                title='Show split view'
              >
                <PanelLeftClose size={16} />
              </Button>
            )}
            <div className='f-13-500 truncate text-gray-900'>{displayTitle}</div>
          </>
        )}
      </div>
      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 text-gray-600 hover:text-gray-900'
          onClick={handleHistory}
          title='Chat history'
        >
          <Clock size={16} />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 text-gray-600 hover:text-gray-900'
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
              className='h-6 w-6 text-gray-600 hover:text-gray-900'
              onClick={handleExpand}
              title='Expand'
            >
              <Maximize2 size={16} />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 text-gray-600 hover:text-gray-900'
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
