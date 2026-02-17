import { FC } from 'react';
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

interface DeleteActivityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const DeleteActivityDialog: FC<DeleteActivityDialogProps> = ({ isOpen, onOpenChange, onDelete, isDeleting }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent size='small' showCloseButton className='w-[400px]' id='delete-activity-dialog'>
        <DialogHeader>
          <DialogHeaderTitle>Delete activity</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-14-400 p-5'>
          Are you sure you want to delete this activity? This action cannot be undone.
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2.5'>
          <DialogClose asChild>
            <Button variant='secondary' size='medium'>
              Cancel
            </Button>
          </DialogClose>
          <Button variant='destructive' size='medium' onClick={onDelete} isLoading={isDeleting} className='w-14'>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteActivityDialog;
