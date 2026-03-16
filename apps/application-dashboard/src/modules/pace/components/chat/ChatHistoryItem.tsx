'use client';

import { type FC, useCallback, useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { Loader, MessagesSquare, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import DeleteConversationDialog from '@/modules/pace/components/chat/DeleteConversationDialog';
import RenameConversationPopover from '@/modules/pace/components/chat/RenameConversationPopover';
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
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTransitioningToRename, setIsTransitioningToRename] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-slot="dropdown-trigger"]')) return;
      if (isDropdownOpen || isRenameOpen || isDeleteOpen) return;
      onSelect(conversation?.id, conversation?.title);
    },
    [conversation?.id, conversation?.title, onSelect, isDropdownOpen, isRenameOpen, isDeleteOpen],
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

  const handleRenameClick = useCallback(() => {
    setIsTransitioningToRename(true);
    setIsDropdownOpen(false);
    setTimeout(() => {
      (document.activeElement as HTMLElement)?.blur();
      setIsRenameOpen(true);
      setIsTransitioningToRename(false);
    }, 150);
  }, []);

  return (
    <div
      className={cn(
        'group hover:bg-accent relative flex cursor-pointer items-center rounded-lg',
        (isDropdownOpen || isRenameOpen || isTransitioningToRename) && 'bg-accent',
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

      <RenameConversationPopover
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        conversationId={conversation?.id}
        organizationId={organizationId}
        currentTitle={conversation?.title || 'Untitled conversation'}
        onSuccess={handleRenameSuccess}
        align='end'
      >
        <div className='absolute right-1'>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                data-slot='dropdown-trigger'
                className={cn(
                  'h-6 w-6 shrink-0 p-0 transition-opacity group-hover:opacity-100 hover:bg-transparent data-[state=open]:opacity-100',
                  isDropdownOpen || isRenameOpen || isTransitioningToRename ? 'opacity-100' : 'opacity-0',
                )}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={14} className='text-GRAY_700' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='min-w-[140px]'>
              <DropdownMenuItem
                className='hover:bg-GRAY_100 flex items-center gap-2 rounded-md'
                onClick={handleRenameClick}
              >
                <Pencil size={14} /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className='hover:bg-GRAY_100 flex items-center gap-2 rounded-md text-red-600 focus:text-red-600'
                onClick={() => setIsDeleteOpen(true)}
              >
                <Trash2 size={14} /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </RenameConversationPopover>

      <DeleteConversationDialog
        conversationId={conversation?.id}
        conversationTitle={conversation?.title || 'Untitled conversation'}
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDeleteSuccess={handleDeleteSuccess}
        onDeleteFailure={handleDeleteFailure}
      />
    </div>
  );
};

export default ChatHistoryItem;
