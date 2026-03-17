'use client';

import { type FC, useCallback, useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import DeleteConversationDialog from '@/modules/pace/components/chat/DeleteConversationDialog';
import RenameConversationDialog from '@/modules/pace/components/chat/RenameConversationDialog';

interface ConversationActionsProps {
  conversationId: string;
  organizationId: string;
  conversationTitle: string;
  onRenameSuccess?: (newTitle: string) => void;
  onDeleteSuccess?: () => void;
  onDeleteFailure?: () => void;
  triggerClassName?: string;
  /** Additional props spread onto the trigger button */
  triggerProps?: React.ComponentPropsWithoutRef<typeof Button>;
  /** Expose dropdown open state to parent */
  onDropdownOpenChange?: (open: boolean) => void;
  align?: 'start' | 'end';
}

const ConversationActions: FC<ConversationActionsProps> = ({
  conversationId,
  organizationId,
  conversationTitle,
  onRenameSuccess,
  onDeleteSuccess,
  onDeleteFailure,
  triggerClassName,
  triggerProps,
  onDropdownOpenChange,
  align = 'end',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDropdownOpenChange = useCallback(
    (open: boolean) => {
      setIsDropdownOpen(open);
      onDropdownOpenChange?.(open);
    },
    [onDropdownOpenChange],
  );

  const handleRenameClick = useCallback(() => {
    setIsDropdownOpen(false);
    onDropdownOpenChange?.(false);
    setIsRenameOpen(true);
  }, [onDropdownOpenChange]);

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={handleDropdownOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            data-slot='dropdown-trigger'
            className={cn('h-6 w-6 shrink-0 p-0', triggerClassName)}
            {...triggerProps}
          >
            <MoreVertical size={14} className='text-GRAY_700' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} className='min-w-[140px]'>
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

      <RenameConversationDialog
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        conversationId={conversationId}
        organizationId={organizationId}
        currentTitle={conversationTitle}
        onSuccess={onRenameSuccess}
      />

      <DeleteConversationDialog
        conversationId={conversationId}
        conversationTitle={conversationTitle}
        isOpen={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onDeleteSuccess={onDeleteSuccess}
        onDeleteFailure={onDeleteFailure}
      />
    </>
  );
};

export default ConversationActions;
