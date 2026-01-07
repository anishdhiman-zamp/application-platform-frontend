'use client';

import type { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowLeft, Clock, Maximize2, Minus, PanelLeftClose, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useMacsContext } from '@/modules/macs/context/MacsContext';
import { ViewMode } from '@/modules/macs/types';

interface ChatTopbarProps {
  className?: string;
  style?: React.CSSProperties;
}

const ChatTopbar: FC<ChatTopbarProps> = ({ className, style }) => {
  const router = useRouter();
  const { chatTitle, setViewMode, viewMode, openSplitViewWithMenu, setShowHistory, showHistory, onChatExpandView } =
    useMacsContext();

  const displayTitle = chatTitle || 'Chat';

  return (
    <div className={cn('flex h-[31px] items-center justify-between gap-x-2 px-3', className)} style={style}>
      <div className='flex min-w-0 flex-1 items-center gap-x-3'>
        {showHistory ? (
          <div className='flex items-center gap-x-3'>
            <Button
              variant='ghost'
              size='icon'
              className='text-GRAY_700 hover:text-GRAY_900 h-6 w-6'
              onClick={() => setShowHistory(false)}
              title='Back to chat'
            >
              <ArrowLeft size={12} />
            </Button>
            <span className='text-GRAY_700 f-12-500'>Back to chat</span>
          </div>
        ) : (
          <>
            {viewMode === ViewMode.Default && (
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6 text-gray-600 hover:text-gray-900'
                onClick={openSplitViewWithMenu}
                title='Show split view'
              >
                <PanelLeftClose size={12} />
              </Button>
            )}
            <div className='f-12-550 min-w-0 flex-1 truncate'>{displayTitle}</div>
          </>
        )}
      </div>
      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 p-2 text-gray-600 hover:text-gray-900'
          onClick={() => setShowHistory(true)}
          title='Chat history'
        >
          <Clock size={12} />
        </Button>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 p-2 text-gray-600 hover:text-gray-900'
          onClick={() => router.push(ROUTES_PATH.CHAT)}
          title='Start new chat'
        >
          <Plus size={12} />
        </Button>
        {viewMode === ViewMode.Split && (
          <>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 text-gray-600 hover:text-gray-900'
              onClick={onChatExpandView}
              title='Expand'
            >
              <Maximize2 size={12} />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-6 w-6 text-gray-600 hover:text-gray-900'
              onClick={() => setViewMode(ViewMode.SectionExpanded)}
              title='Minimize'
            >
              <Minus size={12} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatTopbar;
