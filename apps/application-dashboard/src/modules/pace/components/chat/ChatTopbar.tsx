'use client';

import { type FC, useCallback, useState } from 'react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, MoveDiagonal, Plus } from 'lucide-react';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import ChatHistory from '@/modules/pace/components/chat/ChatHistory';
import ConversationActions from '@/modules/pace/components/chat/ConversationActions';
import ShareConversationPopup from '@/modules/pace/components/chat/ShareConversationPopup';
import { DEFAULT_CHAT_TITLE } from '@/modules/pace/pace.constants';
import { ResourceType, ShareResourceVersion } from '@/modules/shareResource/shareResource.types';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

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
  onSelectConversation,
}) => {
  const displayTitle = title || DEFAULT_CHAT_TITLE;
  const { checkUserPrivilege } = useResourceAccess({
    resourceType: ResourceType.CONVERSATION,
    resourceId: conversationId ?? '',
    skipAudienceData: false,
    version: ShareResourceVersion.V2,
  });
  const isAdmin = checkUserPrivilege(PERMISSION_ROLES.ADMIN);
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

  const handleDeleteFromHistory = useCallback(
    (id: string) => {
      if (id === conversationId) {
        onDeleteConversation?.();
      }
    },
    [conversationId, onDeleteConversation],
  );

  const handleStartNewChat = useCallback(() => {
    setIsHistoryOpen(false);
    onStartNewChat?.();
  }, [onStartNewChat]);

  return (
    <div className={cn('bg-BG_WHITE flex items-center justify-between gap-x-3 p-3', className)} style={style}>
      <div className='flex min-w-0 flex-1 items-center gap-x-1'>
        <Popover open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <PopoverTrigger className='hover:bg-GRAY_100 flex h-7 max-w-full cursor-pointer items-center gap-x-1 rounded-md pr-1 pl-1.5 transition-colors'>
            <span className='relative block min-w-0 overflow-hidden'>
              <AnimatePresence mode='wait' initial={false}>
                <motion.span
                  key={displayTitle}
                  className='f-14-550 block truncate first-letter:uppercase'
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } }}
                  exit={{ opacity: 0, y: -4, transition: { duration: 0.1, ease: 'easeIn' } }}
                >
                  {displayTitle}
                </motion.span>
              </AnimatePresence>
            </span>
            <ChevronDown
              size={14}
              className={cn('text-GRAY_1000 shrink-0 transition-transform', isHistoryOpen && 'rotate-180')}
            />
          </PopoverTrigger>
          <PopoverContent align='start' sideOffset={8} className='flex h-100 w-80 flex-col overflow-hidden p-0'>
            <ChatHistory
              onSelectConversation={handleSelectConversation}
              onDeleteConversation={handleDeleteFromHistory}
              onRenameConversation={handleRenameFromHistory}
              onStartNewChat={onStartNewChat ? handleStartNewChat : undefined}
              activeConversationId={conversationId}
              compact
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className='flex items-center gap-1.5'>
        {isAdmin && conversationId && <ShareConversationPopup conversationId={conversationId} avoidCollisions />}
        {onStartNewChat && conversationId && (
          <Button
            variant='ghost'
            size='icon'
            className='text-GRAY_900 hover:text-GRAY_900 h-7 w-7 rounded p-1.5 disabled:cursor-not-allowed disabled:opacity-50'
            onClick={onStartNewChat}
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
