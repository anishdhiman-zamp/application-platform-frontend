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
import { ProcessResponseType } from 'types/api/processApi.types';

interface DeleteProcessDialogProps {
  process?: ProcessResponseType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (processId: string) => void;
  onDeleteSuccess: () => void;
}

const DeleteProcessDialog: FC<DeleteProcessDialogProps> = ({
  process,
  isOpen,
  onOpenChange,
  onDelete,
  onDeleteSuccess,
}) => {
  const handleDeleteProcess = () => {
    if (!process) return;

    onDelete(process.process_id);

    onOpenChange(false);
    onDeleteSuccess();
  };

  if (!process) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent size='small' showCloseButton className='w-[400px]' id='delete-process-dialog'>
        <DialogHeader>
          <DialogHeaderTitle>Delete process '{process.display_name}'</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-14-400 p-5'>
          Deleting the {process.display_name} process will permanently remove it and all its pages. This action cannot
          be undone.
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
            onClick={handleDeleteProcess}
            className='w-14'
            data-testid={`${process.process_id}-delete-process-dialog-delete-btn`}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProcessDialog;
