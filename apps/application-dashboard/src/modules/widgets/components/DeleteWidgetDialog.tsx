import React from 'react';
import { ConfirmationDialog, toast } from '@zamp-platform/ui';
import { useDeleteWidgetMutation } from '@/apis/widgets';

interface DeleteWidgetDialogProps {
  widgetId: string;
  widgetTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteWidgetDialog = ({ widgetId, widgetTitle, isOpen, onOpenChange }: DeleteWidgetDialogProps) => {
  const [deleteWidget, { isLoading: isDeletingWidget }] = useDeleteWidgetMutation();

  const handleDeleteWidget = () => {
    deleteWidget(widgetId)
      .unwrap()
      .then(() => {
        toast.success(`${widgetTitle} widget deleted successfully`);
      })
      .catch(() => {
        toast.error(`Failed to delete ${widgetTitle} widget`);
      })
      .finally(() => {
        onOpenChange(false);
      });
  };

  return (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      title={`Delete widget '${widgetTitle}'`}
      description='Are you sure you want to delete this widget? This action cannot be undone.'
      confirmLabel='Delete'
      isLoading={isDeletingWidget}
      onConfirm={handleDeleteWidget}
      confirmButtonClassName='w-14'
      confirmButtonTestId={`${widgetId}-delete-widget-dialog-delete-btn`}
    />
  );
};

export default DeleteWidgetDialog;
