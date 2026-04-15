import { ConfirmationDialog } from '@zamp-platform/ui';

interface DeleteActivityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const DeleteActivityDialog = ({ isOpen, onOpenChange, onDelete, isDeleting }: DeleteActivityDialogProps) => {
  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title='Delete activity'
      description='Are you sure you want to delete this activity? This action cannot be undone.'
      confirmLabel='Delete'
      isLoading={isDeleting}
      onConfirm={onDelete}
      confirmButtonClassName='w-14'
      contentId='delete-activity-dialog'
    />
  );
};

export default DeleteActivityDialog;
