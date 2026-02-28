'use client';

import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
} from '@zamp-platform/ui';

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size='small' showCloseButton className='w-[400px]' id='delete-file-dialog'>
        <DialogHeader className='border-none'>
          <DialogHeaderTitle>Delete {itemType === 'folder' ? 'Folder' : 'File'}</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-14-400 px-5 pt-0 pb-5'>
          Are you sure you want to delete <span className='font-medium'>{itemName}</span>? This action cannot be undone.
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2.5'>
          <DialogClose asChild>
            <Button variant='secondary'>Cancel</Button>
          </DialogClose>
          <Button variant='destructive' onClick={onConfirm} isLoading={isDeleting}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
