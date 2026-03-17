'use client';

import { type FC, useCallback } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Expand, Minus, Plus } from 'lucide-react';
import ConversationActions from '@/modules/pace/components/chat/ConversationActions';
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
  onDeleteConversation?: () => void;
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
  onDeleteConversation,
}) => {
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
      <div className='flex h-7 min-w-0 flex-1 items-center'>
        <span className='f-13-500 block max-w-full truncate first-letter:uppercase'>{displayTitle}</span>
      </div>
      <div className='flex items-center gap-1.5'>
        {canEdit && (
          <ConversationActions
            conversationId={conversationId ?? ''}
            organizationId={organizationId ?? ''}
            conversationTitle={displayTitle}
            onRenameSuccess={handleRenameSuccess}
            onDeleteSuccess={onDeleteConversation}
            triggerClassName='rounded p-2 text-gray-900 hover:text-gray-900'
          />
        )}
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
