'use client';

import { ConfirmationDialog } from '@zamp-platform/ui';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  itemType: 'file' | 'folder';
  isDeleting: boolean;
  onConfirm: () => void;
}

const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  itemName,
  itemType,
  isDeleting,
  onConfirm,
}: DeleteConfirmationDialogProps) => {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Delete ${itemType === 'folder' ? 'Folder' : 'File'}`}
      description={
        <>
          Are you sure you want to delete <span className='font-medium'>{itemName}</span>? This action cannot be undone.
        </>
      }
      confirmLabel='Delete'
      isLoading={isDeleting}
      onConfirm={onConfirm}
      confirmButtonClassName='w-14'
      contentId='delete-file-dialog'
    />
  );
};

export default DeleteConfirmationDialog;
