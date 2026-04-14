'use client';

import { type FC, useCallback } from 'react';
import { ConfirmationDialog, toast } from '@zamp-platform/ui';
import { useDeleteConversationMutation } from '@/apis/pace';

interface DeleteConversationDialogProps {
  conversationId: string;
  conversationTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess?: () => void;
  onDeleteFailure?: () => void;
}

const DeleteConversationDialog: FC<DeleteConversationDialogProps> = ({
  conversationId,
  conversationTitle,
  isOpen,
  onOpenChange,
  onDeleteSuccess,
  onDeleteFailure,
}) => {
  const [deleteConversation] = useDeleteConversationMutation();

  const handleDelete = useCallback(() => {
    onOpenChange(false);
    onDeleteSuccess?.();

    deleteConversation({ conversationId })
      .unwrap()
      .catch(() => {
        onDeleteFailure?.();
        toast.error('Failed to delete conversation');
      });
  }, [deleteConversation, conversationId, onOpenChange, onDeleteSuccess, onDeleteFailure]);

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title='Delete conversation'
      description={
        <>
          Are you sure you want to delete <span className='font-medium'>{conversationTitle}</span>? This action cannot
          be undone.
        </>
      }
      confirmLabel='Delete'
      onConfirm={handleDelete}
      confirmButtonClassName='w-14'
    />
  );
};

export default DeleteConversationDialog;
