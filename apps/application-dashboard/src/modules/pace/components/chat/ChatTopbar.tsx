'use client';

import { type FC, useCallback } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { MoveDiagonal, Plus } from 'lucide-react';
import ConversationActions from '@/modules/pace/components/chat/ConversationActions';
import { DEFAULT_CHAT_TITLE } from '@/modules/pace/pace.constants';

interface ChatTopbarProps {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  conversationId?: string | null;
  organizationId?: string;
  onStartNewChat?: () => void;
  onExpand?: () => void;
  onTitleChange?: (newTitle: string) => void;
  onDeleteConversation?: () => void;
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
      </div>
    </div>
  );
};

export default ChatTopbar;
