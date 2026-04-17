'use client';

import { useCallback, useMemo, useState } from 'react';
import { AnimatedDot } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { formatTimestampToUTC } from '@zamp-platform/utils/date';
import { Loader2 } from 'lucide-react';
import ConversationActions from '@/modules/pace/components/chat/ConversationActions';
import { formatRelativeTime } from '@/modules/pace/components/files/file-tree.utils';
import type { FeedbackItemType } from '@/types/api/feedbacks.types';

const INTERACTIVE_SELECTORS = [
  '[data-slot="dropdown-trigger"]',
  '[role="menu"]',
  '[data-slot="rename-conversation-dialog"]',
  '[data-slot="delete-conversation-dialog"]',
];

interface ChatHistoryItemProps {
  conversation: FeedbackItemType;
  onSelect: (id: string | null, title?: string) => void;
  isStreaming?: boolean;
  isSelected?: boolean;
  isUnread?: boolean;
  organizationId: string;
  onDelete?: (id: string) => void;
  onDeleteFailure?: (conversation: FeedbackItemType) => void;
  onRename?: (id: string, newTitle: string) => void;
}

const ChatHistoryItem = ({
  conversation,
  onSelect,
  isStreaming,
  isSelected,
  isUnread,
  organizationId,
  onDelete,
  onDeleteFailure,
  onRename,
}: ChatHistoryItemProps) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const renderStatusIcon = () => {
    if (isStreaming) return <Loader2 className='text-BLUE_700 h-3 w-3 shrink-0 animate-spin' />;
    if (isUnread) return <AnimatedDot showAnimation className='shrink-0' size={7} />;

    return null;
  };

  const relativeTime = useMemo(() => {
    const timestamp = conversation?.updated_at || conversation?.created_at;

    if (!timestamp) return null;

    return formatRelativeTime(new Date(formatTimestampToUTC(timestamp)).getTime());
  }, [conversation?.updated_at, conversation?.created_at]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;

      if (INTERACTIVE_SELECTORS.some((selector) => target.closest(selector))) {
        e.preventDefault();
        e.stopPropagation();

        return;
      }

      onSelect(conversation?.id, conversation?.title);
    },
    [conversation?.id, conversation?.title, onSelect],
  );

  const handleDeleteSuccess = useCallback(() => {
    onDelete?.(conversation?.id);
  }, [onDelete, conversation?.id]);

  const handleDeleteFailure = useCallback(() => {
    onDeleteFailure?.(conversation);
  }, [onDeleteFailure, conversation]);

  const handleRenameSuccess = useCallback(
    (newTitle: string) => {
      onRename?.(conversation?.id, newTitle);
    },
    [onRename, conversation?.id],
  );

  const statusIcon = renderStatusIcon();
  const hasStatusIcon = Boolean(statusIcon);

  return (
    <div
      className={cn(
        'group hover:bg-accent relative flex cursor-pointer items-center rounded-lg',
        isSelected && 'bg-GRAY_200',
        isActionsOpen && 'bg-accent',
      )}
      onClick={handleClick}
    >
      <div className='flex h-auto w-full flex-col justify-start px-3 py-2.5 pr-9'>
        <div className='flex items-center gap-2'>
          <p className='f-13-500 text-GRAY_1000 min-w-0 flex-1 truncate text-left first-letter:uppercase'>
            {conversation?.title || 'Untitled conversation'}
          </p>

          {relativeTime && <span className='f-12-400 text-GRAY_600 shrink-0 whitespace-nowrap'>{relativeTime}</span>}
        </div>
      </div>

      <div className='absolute right-1 flex items-center justify-center'>
        {hasStatusIcon && (
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center transition-opacity',
              isActionsOpen ? 'opacity-0' : 'group-hover:opacity-0',
            )}
          >
            {statusIcon}
          </span>
        )}
        <ConversationActions
          conversationId={conversation?.id}
          organizationId={organizationId}
          conversationTitle={conversation?.title || 'Untitled conversation'}
          onRenameSuccess={handleRenameSuccess}
          onDeleteSuccess={handleDeleteSuccess}
          onDeleteFailure={handleDeleteFailure}
          onOpenChange={setIsActionsOpen}
          triggerClassName={cn(
            'hover:bg-transparent data-[state=open]:opacity-100 transition-opacity',
            hasStatusIcon && 'absolute',
            isActionsOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
          triggerProps={{ onClick: (e) => e.stopPropagation() }}
        />
      </div>
    </div>
  );
};

export default ChatHistoryItem;
