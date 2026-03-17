'use client';

import { type FC, useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
  toast,
} from '@zamp-platform/ui';
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent size='small' showCloseButton className='w-[400px] outline-none'>
        <DialogHeader>
          <DialogHeaderTitle>Delete conversation</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-14-400 p-5'>
          Are you sure you want to delete <span className='font-medium'>{conversationTitle}</span>? This action cannot
          be undone.
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2.5'>
          <DialogClose asChild>
            <Button variant='secondary' size='medium'>
              Cancel
            </Button>
          </DialogClose>
          <Button variant='destructive' size='medium' onClick={handleDelete} className='w-14'>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConversationDialog;
