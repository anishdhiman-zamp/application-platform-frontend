'use client';

import { type FC, useCallback, useState } from 'react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ArrowLeft, ChevronDown, MoveDiagonal, Plus } from 'lucide-react';
import ChatHistory from '@/modules/pace/components/chat/ChatHistory';
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
  showHistory?: boolean;
  showBackButton?: boolean;
  showActions?: boolean;
  onBack?: () => void;
  navigationSlot?: React.ReactNode;
  titleIcon?: React.ReactNode;
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
  onSelectConversation,
  showHistory = true,
  showBackButton = false,
  showActions = true,
  onBack,
  navigationSlot,
  titleIcon,
}) => {
  const displayTitle = title || DEFAULT_CHAT_TITLE;
  const canEdit = Boolean(conversationId && organizationId);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleRenameSuccess = useCallback(
    (newTitle: string) => {
      onTitleChange?.(newTitle);
    },
    [onTitleChange],
  );

  const handleSelectConversation = useCallback(
    (id: string | null, selectedTitle?: string) => {
      setIsHistoryOpen(false);
      onSelectConversation?.(id, selectedTitle);
    },
    [onSelectConversation],
  );

  const handleRenameFromHistory = useCallback(
    (id: string, newTitle: string) => {
      if (id === conversationId) {
        onTitleChange?.(newTitle);
      }
    },
    [conversationId, onTitleChange],
  );

  return (
    <div className={cn('bg-BG_WHITE flex items-center justify-between gap-x-3 p-3', className)} style={style}>
      <div className='flex min-w-0 flex-1 items-center gap-x-1'>
        {showBackButton && (
          <Button
            variant='ghost'
            size='icon'
            className='text-GRAY_700 hover:text-GRAY_1000 h-7 w-7 shrink-0 rounded p-1'
            onClick={onBack}
            aria-label='Go back'
          >
            <ArrowLeft size={16} />
          </Button>
        )}
        {showHistory ? (
          <Popover open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <PopoverTrigger className='hover:bg-GRAY_100 flex h-7 max-w-full cursor-pointer items-center gap-x-1 rounded-md pr-1 pl-1.5 transition-colors'>
              <span className='f-14-550 block min-w-0 truncate first-letter:uppercase'>{displayTitle}</span>
              <ChevronDown
                size={14}
                className={cn('text-GRAY_1000 shrink-0 transition-transform', isHistoryOpen && 'rotate-180')}
              />
            </PopoverTrigger>
            <PopoverContent align='start' sideOffset={8} className='flex h-100 w-80 flex-col overflow-hidden p-0'>
              <ChatHistory
                onSelectConversation={handleSelectConversation}
                onRenameConversation={handleRenameFromHistory}
                activeConversationId={conversationId}
                compact
              />
            </PopoverContent>
          </Popover>
        ) : (
          <div className='flex h-7 max-w-full items-center gap-x-1.5 px-1'>
            {titleIcon}
            <span className='f-14-550 block min-w-0 truncate first-letter:uppercase'>{displayTitle}</span>
          </div>
        )}
      </div>
      <div className='flex items-center gap-1.5'>
        {navigationSlot}
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
        {showActions && canEdit && (
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
