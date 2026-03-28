'use client';

import { type FC, useCallback, useMemo, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { formatTimestampToUTC } from '@zamp-platform/utils/date';
import { Check } from 'lucide-react';
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
  organizationId: string;
  onDelete?: (id: string) => void;
  onDeleteFailure?: (conversation: FeedbackItemType) => void;
  onRename?: (id: string, newTitle: string) => void;
}

const ChatHistoryItem: FC<ChatHistoryItemProps> = ({
  conversation,
  onSelect,
  isStreaming,
  isSelected,
  organizationId,
  onDelete,
  onDeleteFailure,
  onRename,
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

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

  return (
    <div
      className={cn(
        'group hover:bg-accent relative flex cursor-pointer items-center rounded-lg',
        isSelected && 'bg-GRAY_200',
        isActionsOpen && 'bg-accent',
      )}
      onClick={handleClick}
    >
      <div className='flex h-auto w-full items-center justify-start gap-2.5 px-3 py-2.5 pr-9'>
        <span className='flex h-4 w-4 shrink-0 items-center justify-center'>
          {isSelected ? (
            <Check size={14} className='text-GRAY_1000' />
          ) : isStreaming ? (
            <span className='relative flex h-2 w-2'>
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75' />
              <span className='relative inline-flex h-2 w-2 rounded-full bg-blue-500' />
            </span>
          ) : null}
        </span>
        <p className='f-13-500 text-GRAY_1000 min-w-0 flex-1 truncate text-left first-letter:uppercase'>
          {conversation?.title || 'Untitled conversation'}
        </p>
        {relativeTime && <span className='f-12-400 text-GRAY_600 shrink-0 whitespace-nowrap'>{relativeTime}</span>}
      </div>

      <div className='absolute right-1'>
        <ConversationActions
          conversationId={conversation?.id}
          organizationId={organizationId}
          conversationTitle={conversation?.title || 'Untitled conversation'}
          onRenameSuccess={handleRenameSuccess}
          onDeleteSuccess={handleDeleteSuccess}
          onDeleteFailure={handleDeleteFailure}
          onOpenChange={setIsActionsOpen}
          triggerClassName={cn(
            'transition-opacity group-hover:opacity-100 hover:bg-transparent data-[state=open]:opacity-100',
            isActionsOpen ? 'opacity-100' : 'opacity-0',
          )}
          triggerProps={{ onClick: (e) => e.stopPropagation() }}
        />
      </div>
    </div>
  );
};

export default ChatHistoryItem;
