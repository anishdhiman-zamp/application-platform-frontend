'use client';

import { type FC, useCallback, useEffect, useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useResourceAccess } from '@/hooks/useResourceAccess';
import DeleteConversationDialog from '@/modules/pace/components/chat/DeleteConversationDialog';
import RenameConversationDialog from '@/modules/pace/components/chat/RenameConversationDialog';
import { ResourceType, ShareResourceVersion } from '@/modules/shareResource/shareResource.types';
import { PERMISSION_ROLES } from '@/utils/accessPermission/accessPermission.types';

interface ConversationActionsProps {
  conversationId: string;
  organizationId: string;
  conversationTitle: string;
  onRenameSuccess?: (newTitle: string) => void;
  onDeleteSuccess?: () => void;
  onDeleteFailure?: () => void;
  triggerClassName?: string;
  triggerProps?: React.ComponentPropsWithoutRef<typeof Button>;
  onOpenChange?: (open: boolean) => void;
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
  onOpenChange,
  align = 'end',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { checkUserPrivilege, isLoadingAudiencesData, isUninitialized } = useResourceAccess({
    resourceType: ResourceType.CONVERSATION,
    resourceId: conversationId,
    skipAudienceData: !isDropdownOpen,
    version: ShareResourceVersion.V2,
  });
  const isAdmin = checkUserPrivilege(PERMISSION_ROLES.ADMIN);
  const areActionsDisabled = isLoadingAudiencesData || isUninitialized || !isAdmin;

  const isAnyOpen = isDropdownOpen || isRenameOpen || isDeleteOpen;

  useEffect(() => {
    onOpenChange?.(isAnyOpen);
  }, [isAnyOpen, onOpenChange]);

  const handleRenameClick = useCallback(() => {
    if (areActionsDisabled) return;
    setIsDropdownOpen(false);
    setIsRenameOpen(true);
  }, [areActionsDisabled]);

  const handleDeleteClick = useCallback(() => {
    if (areActionsDisabled) return;
    setIsDeleteOpen(true);
  }, [areActionsDisabled]);

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
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
            className='hover:bg-GRAY_100 flex items-center gap-2 rounded-md data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50'
            onClick={handleRenameClick}
            disabled={areActionsDisabled}
          >
            <Pencil size={14} /> Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className='hover:bg-GRAY_100 flex items-center gap-2 rounded-md text-red-600 focus:text-red-600 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50'
            onClick={handleDeleteClick}
            disabled={areActionsDisabled}
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
