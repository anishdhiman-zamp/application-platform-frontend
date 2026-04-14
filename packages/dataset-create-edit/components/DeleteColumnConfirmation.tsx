import { ConfirmationDialog } from '@zamp-platform/ui';
import { FC, useCallback } from 'react';

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
  const handleConfirm = useCallback(() => {
    onConfirm();
    onOpenChange(false);
  }, [onConfirm, onOpenChange]);

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title={`Delete column '${columnName}'`}
      description='Are you sure you want to delete this column? This action cannot be undone.'
      confirmLabel='Delete'
      onConfirm={handleConfirm}
    />
  );
};

export default DeleteColumnConfirmation;
