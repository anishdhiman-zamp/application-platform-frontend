'use client';

import type { FC } from 'react';
import { Button, Input, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Minus, Plus } from 'lucide-react';
import { useEditableTitle } from '@/modules/pace/hooks/useEditableTitle';

interface ChatTopbarProps {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  conversationId?: string | null;
  organizationId?: string;
  onStartNewChat: () => void;
  onClose?: () => void;
  onTitleChange?: (newTitle: string) => void;
}

const ChatTopbar: FC<ChatTopbarProps> = ({
  className,
  style,
  title,
  conversationId,
  organizationId,
  onStartNewChat,
  onClose,
  onTitleChange,
}) => {
  const {
    displayTitle,
    isEditing,
    editValue,
    canEdit,
    handleTitleClick,
    handleChange,
    handleKeyDown,
    handleBlur,
    inputRefCallback,
  } = useEditableTitle({
    title,
    conversationId,
    organizationId,
    onTitleChange,
  });

  return (
    <div
      className={cn('border-GRAY_400 flex items-center justify-between gap-x-3 border-b p-3', className)}
      style={style}
    >
      <div className='relative flex h-7 min-w-0 flex-1 items-center'>
        {isEditing ? (
          <Input
            ref={inputRefCallback}
            type='text'
            value={editValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className='f-13-500 h-7 max-w-[150px] px-1 select-none'
            placeholder='Enter title...'
            maxLength={500}
          />
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={cn('f-13-500 block truncate', canEdit && 'cursor-pointer')} onClick={handleTitleClick}>
                  {displayTitle}
                </span>
              </TooltipTrigger>
              <TooltipContent side='bottom' align='start'>
                Rename
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className='flex items-center gap-1.5'>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 rounded p-2 text-gray-900 hover:text-gray-900'
          onClick={onStartNewChat}
          title='Start new chat'
        >
          <Plus size={14} />
        </Button>
        {onClose && (
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 rounded p-2 text-gray-900 hover:text-gray-900'
            onClick={onClose}
            title='Close chat'
          >
            <Minus size={14} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatTopbar;
