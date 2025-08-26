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
  toast,
} from '@zamp-platform/ui';
import { useDeleteSheetByPageIdMutation } from 'apis/pages';

interface DeleteSheetDialogProps {
  pageId: string;
  sheetId: string;
  sheetName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess: () => void;
}

const DeleteSheetDialog: FC<DeleteSheetDialogProps> = ({
  pageId,
  sheetId,
  sheetName,
  isOpen,
  onOpenChange,
  onDeleteSuccess,
}) => {
  const [deleteSheetByPageId, { isLoading: isDeletingSheet }] = useDeleteSheetByPageIdMutation();

  const handleDeleteSheet = () => {
    deleteSheetByPageId({ pageId, sheetId })
      .unwrap()
      .then(() => {
        toast.success(`Sheet "${sheetName}" deleted successfully`);
        onDeleteSuccess();
      })
      .catch(() => {
        toast.error(`Failed to delete sheet "${sheetName}"`);
      })
      .finally(() => {
        onOpenChange(false);
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent size='small' showCloseButton className='w-[400px]'>
        <DialogHeader>
          <DialogHeaderTitle>Delete sheet '{sheetName}'</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-14-400 p-5'>
          Are you sure you want to delete this sheet? This action cannot be undone and all widgets and data in this
          sheet will be permanently removed.
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
            onClick={handleDeleteSheet}
            isLoading={isDeletingSheet}
            className='w-14'
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSheetDialog;
