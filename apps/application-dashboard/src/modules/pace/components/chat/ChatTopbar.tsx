'use client';

import { type FC, useCallback, useState } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Expand, Minus, Plus } from 'lucide-react';
import RenameConversationPopover from '@/modules/pace/components/chat/RenameConversationPopover';
import { DEFAULT_CHAT_TITLE } from '@/modules/pace/pace.constants';

interface ChatTopbarProps {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  conversationId?: string | null;
  organizationId?: string;
  onStartNewChat?: () => void;
  onClose?: () => void;
  onExpand?: () => void;
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
  onExpand,
  onTitleChange,
}) => {
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const displayTitle = title || DEFAULT_CHAT_TITLE;
  const canEdit = Boolean(conversationId && organizationId);

  const handleRenameSuccess = useCallback(
    (newTitle: string) => {
      onTitleChange?.(newTitle);
    },
    [onTitleChange],
  );

  return (
    <div className={cn('bg-BG_WHITE flex items-center justify-between gap-x-3 p-3', className)} style={style}>
      <div className='relative flex h-7 min-w-0 flex-1 items-center'>
        <RenameConversationPopover
          open={isRenameOpen}
          onOpenChange={setIsRenameOpen}
          conversationId={conversationId ?? ''}
          organizationId={organizationId ?? ''}
          currentTitle={displayTitle}
          onSuccess={handleRenameSuccess}
        >
          <span
            className={cn('f-13-500 block max-w-full truncate first-letter:uppercase', canEdit && 'cursor-pointer')}
            onClick={() => canEdit && setIsRenameOpen(true)}
          >
            {displayTitle}
          </span>
        </RenameConversationPopover>
      </div>
      <div className='flex items-center gap-1.5'>
        {onStartNewChat && (
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 rounded p-2 text-gray-900 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={onStartNewChat}
            disabled={!conversationId}
            title='Start new chat'
          >
            <Plus size={14} />
          </Button>
        )}
        {onExpand && (
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 rounded p-2 text-gray-900 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={onExpand}
            title='Open in full page'
          >
            <Expand size={14} />
          </Button>
        )}
        {onClose && (
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 rounded p-2 text-gray-900 hover:text-gray-900 disabled:cursor-not-allowed'
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
