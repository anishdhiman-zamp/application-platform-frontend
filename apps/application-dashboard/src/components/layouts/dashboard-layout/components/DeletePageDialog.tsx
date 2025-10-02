import React, { FC } from 'react';
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
import { useDeletePageMutation } from 'apis/pages';
import { PageResponseType } from 'types/api/pagesApi.types';

interface DeletePageDialogProps {
  page?: PageResponseType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess: () => void;
}

const DeletePageDialog: FC<DeletePageDialogProps> = ({ page, isOpen, onOpenChange, onDeleteSuccess }) => {
  const [deletePage, { isLoading: isDeletingPage }] = useDeletePageMutation();

  const handleDeletePage = () => {
    if (!page) return;
    deletePage(page.page_id)
      .unwrap()
      .then(() => {
        toast.success(`${page.name} page deleted successfully`);
        onDeleteSuccess();
        onOpenChange(false);
      })
      .catch(() => {
        toast.error(`Failed to delete ${page.name} page`);
      });
  };

  if (!page) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent size='small' showCloseButton className='w-[400px]' id='delete-page-dialog'>
        <DialogHeader>
          <DialogHeaderTitle>Delete page '{page.name}'</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-14-400 p-5'>
          Deleting the {page?.name} page will permanently remove it and all its sheets. This action cannot be undone.
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
            onClick={handleDeletePage}
            isLoading={isDeletingPage}
            className='w-14'
            data-testid={`${page.page_id}-delete-page-dialog-delete-btn`}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePageDialog;
