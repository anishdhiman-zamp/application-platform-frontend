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
import { FC } from 'react';

interface DeleteColumnConfirmationProps {
  isOpen: boolean;
  columnName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const DeleteColumnConfirmation: FC<DeleteColumnConfirmationProps> = ({
  isOpen,
  columnName,
  onOpenChange,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent size='small' showCloseButton className='w-[400px]'>
        <DialogHeader>
          <DialogHeaderTitle>Delete column &apos;{columnName}&apos;</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-14-400 p-5'>
          Are you sure you want to delete this column? This action cannot be undone.
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2.5'>
          <DialogClose asChild>
            <Button variant='secondary' size='medium'>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant='destructive'
            size='medium'
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteColumnConfirmation;
