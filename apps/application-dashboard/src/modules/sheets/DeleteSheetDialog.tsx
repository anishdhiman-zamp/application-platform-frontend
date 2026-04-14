import { ConfirmationDialog, toast } from '@zamp-platform/ui';
import { useDeleteSheetByPageIdMutation } from 'apis/pages';

interface DeleteSheetDialogProps {
  pageId: string;
  sheetId: string;
  sheetName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteSuccess: () => void;
}

const DeleteSheetDialog = ({
  pageId,
  sheetId,
  sheetName,
  isOpen,
  onOpenChange,
  onDeleteSuccess,
}: DeleteSheetDialogProps) => {
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
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title={`Delete sheet '${sheetName}'`}
      description='Are you sure you want to delete this sheet? This action cannot be undone and all widgets and data in this sheet will be permanently removed.'
      confirmLabel='Delete'
      isLoading={isDeletingSheet}
      onConfirm={handleDeleteSheet}
      confirmButtonClassName='w-14'
      confirmButtonTestId={`${sheetId}-delete-sheet-dialog-delete-btn`}
    />
  );
};

export default DeleteSheetDialog;
