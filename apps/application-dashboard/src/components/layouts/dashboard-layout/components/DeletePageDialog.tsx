import React from 'react';
import { ConfirmationDialog, toast } from '@zamp-platform/ui';
import { useDeletePageMutation } from 'apis/pages';
import { PageResponseType } from 'types/api/pagesApi.types';

interface DeletePageDialogProps {
  page?: PageResponseType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess: () => void;
}

const DeletePageDialog = ({ page, isOpen, onOpenChange, onDeleteSuccess }: DeletePageDialogProps) => {
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
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title={`Delete page '${page.name}'`}
      description={`Deleting the ${page.name} page will permanently remove it and all its sheets. This action cannot be undone.`}
      confirmLabel='Delete'
      isLoading={isDeletingPage}
      onConfirm={handleDeletePage}
      confirmButtonClassName='w-14'
      confirmButtonTestId={`${page.page_id}-delete-page-dialog-delete-btn`}
      contentId='delete-page-dialog'
    />
  );
};

export default DeletePageDialog;
