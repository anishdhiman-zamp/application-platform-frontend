'use client';

import { type FC, useCallback, useState } from 'react';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronDown, MoveDiagonal, Plus } from 'lucide-react';
import ChatHistory from '@/modules/pace/components/chat/ChatHistory';
import { useEditableTitle } from '@/modules/pace/hooks/useEditableTitle';

interface ChatTopbarProps {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  conversationId?: string | null;
  organizationId?: string;
  onStartNewChat?: () => void;
  onExpand?: () => void;
  onTitleChange?: (newTitle: string) => void;
  onSelectConversation?: (id: string | null, title?: string) => void;
}

const ChatTopbar: FC<ChatTopbarProps> = ({
  className,
  style,
  title,
  conversationId,
  organizationId,
  onStartNewChat,
  onExpand,
  onTitleChange,
  onSelectConversation,
}) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const {
    displayTitle,
    editValue,
    canEdit,
    handleChange,
    handleKeyDown: originalHandleKeyDown,
    handleBlur: originalHandleBlur,
    inputRefCallback,
  } = useEditableTitle({
    title,
    conversationId,
    organizationId,
    onTitleChange,
  });

  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        setIsRenameOpen(false);
      }
      originalHandleKeyDown(e);
    },
    [originalHandleKeyDown],
  );

  const handleRenameBlur = useCallback(() => {
    originalHandleBlur();
    setIsRenameOpen(false);
  }, [originalHandleBlur]);

  const handleSelectConversation = useCallback(
    (id: string | null, chatTitle?: string) => {
      setIsHistoryOpen(false);
      onSelectConversation?.(id, chatTitle);
    },
    [onSelectConversation],
  );

  return (
    <div className={cn('bg-BG_WHITE flex items-center justify-between gap-x-3 px-3 py-2', className)} style={style}>
      <div className='relative flex min-w-0 flex-1 items-center'>
        <div className='group/title flex min-w-0 items-stretch gap-x-1'>
          <Popover open={isRenameOpen} onOpenChange={(open) => canEdit && setIsRenameOpen(open)}>
            <PopoverTrigger asChild disabled={!canEdit}>
              <span
                className={cn(
                  'f-14-550 group-hover/title:bg-GRAY_100 block truncate rounded-l-md px-1.5 py-0.5',
                  canEdit && 'cursor-pointer',
                  isRenameOpen || (isHistoryOpen && 'bg-GRAY_100'),
                )}
              >
                {displayTitle}
              </span>
            </PopoverTrigger>
            <PopoverContent side='bottom' align='start' className='w-[260px] p-2'>
              <Input
                ref={inputRefCallback}
                type='text'
                value={editValue}
                onChange={handleChange}
                onBlur={handleRenameBlur}
                onKeyDown={handleRenameKeyDown}
                className='f-13-500 h-8 w-full'
                placeholder='Enter title...'
                maxLength={500}
              />
            </PopoverContent>
          </Popover>

          {onSelectConversation && (
            <DropdownMenu open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <DropdownMenuTrigger asChild>
                <span
                  className={cn(
                    'group-hover/title:bg-GRAY_100 flex shrink-0 cursor-pointer items-center rounded-r-md px-1.5 py-0.5 outline-none',
                    isRenameOpen || (isHistoryOpen && 'bg-GRAY_100'),
                  )}
                >
                  <ChevronDown
                    size={14}
                    className={cn('text-GRAY_1000 transition-transform', isHistoryOpen && 'rotate-180')}
                  />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side='bottom'
                align='start'
                className='flex h-[400px] w-[320px] flex-col overflow-hidden p-0'
                onCloseAutoFocus={(e) => e.preventDefault()}
              >
                <ChatHistory onSelectConversation={handleSelectConversation} compact />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      <div className='flex items-center gap-x-1.5'>
        {onExpand && (
          <Button
            variant='ghost'
            size='icon'
            className='text-GRAY_900 hover:text-GRAY_900 h-7 w-7 rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={onExpand}
            title='Open in full page'
          >
            <MoveDiagonal size={16} />
          </Button>
        )}
        {onStartNewChat && (
          <Button
            variant='ghost'
            size='icon'
            className='text-GRAY_900 hover:text-GRAY_900 h-7 w-7 rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={onStartNewChat}
            disabled={!conversationId}
            title='Start new chat'
          >
            <Plus size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatTopbar;
