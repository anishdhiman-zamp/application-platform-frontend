'use client';

import { type FC, useCallback, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { Loader, MessagesSquare } from 'lucide-react';
import ConversationActions from '@/modules/pace/components/chat/ConversationActions';
import type { FeedbackItemType } from '@/types/api/feedbacks.types';

interface ChatHistoryItemProps {
  conversation: FeedbackItemType;
  onSelect: (id: string | null, title?: string) => void;
  isStreaming?: boolean;
  organizationId: string;
  onDelete?: (id: string) => void;
  onDeleteFailure?: (conversation: FeedbackItemType) => void;
  onRename?: (id: string, newTitle: string) => void;
}

const ChatHistoryItem: FC<ChatHistoryItemProps> = ({
  conversation,
  onSelect,
  isStreaming,
  organizationId,
  onDelete,
  onDeleteFailure,
  onRename,
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-slot="dropdown-trigger"]')) return;
      if (isActionsOpen) return;
      onSelect(conversation?.id, conversation?.title);
    },
    [conversation?.id, conversation?.title, onSelect, isActionsOpen],
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
        isActionsOpen && 'bg-accent',
      )}
      onClick={handleClick}
    >
      <div className='flex h-auto w-full items-center justify-start gap-2.5 px-3 py-2.5 pr-9'>
        <MessagesSquare size={16} className='text-GRAY_700 shrink-0' />
        <p className='f-13-500 text-GRAY_1000 line-clamp-1 text-left first-letter:uppercase'>
          {conversation?.title || 'Untitled conversation'}
        </p>
        {isStreaming && <Loader size={14} className='text-GRAY_700 ml-auto shrink-0 animate-spin' />}
      </div>

      <div className='absolute right-1'>
        <ConversationActions
          conversationId={conversation?.id}
          organizationId={organizationId}
          conversationTitle={conversation?.title || 'Untitled conversation'}
          onRenameSuccess={handleRenameSuccess}
          onDeleteSuccess={handleDeleteSuccess}
          onDeleteFailure={handleDeleteFailure}
          onDropdownOpenChange={setIsActionsOpen}
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
