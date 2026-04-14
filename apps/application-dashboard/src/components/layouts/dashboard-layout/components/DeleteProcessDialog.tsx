import { ConfirmationDialog } from '@zamp-platform/ui';
import { ProcessResponseType } from 'types/api/processApi.types';

interface DeleteProcessDialogProps {
  process?: ProcessResponseType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (processId: string) => void;
  onDeleteSuccess: () => void;
}

const DeleteProcessDialog = ({
  process,
  isOpen,
  onOpenChange,
  onDelete,
  onDeleteSuccess,
}: DeleteProcessDialogProps) => {
  const handleDeleteProcess = () => {
    if (!process) return;

    onDelete(process.process_id);
    onOpenChange(false);
    onDeleteSuccess();
  };

  if (!process) return null;

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title={`Delete process '${process.display_name}'`}
      description={`Deleting the ${process.display_name} process will permanently remove it and all its pages. This action cannot be undone.`}
      confirmLabel='Delete'
      onConfirm={handleDeleteProcess}
      confirmButtonClassName='w-14'
      confirmButtonTestId={`${process.process_id}-delete-process-dialog-delete-btn`}
      contentId='delete-process-dialog'
    />
  );
};

export default DeleteProcessDialog;
