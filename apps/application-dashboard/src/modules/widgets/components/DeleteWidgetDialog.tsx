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
import { useDeleteWidgetMutation } from '@/apis/widgets';

interface DeleteWidgetDialogProps {
  widgetId: string;
  widgetTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteWidgetDialog: FC<DeleteWidgetDialogProps> = ({ widgetId, widgetTitle, isOpen, onOpenChange }) => {
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent size='small' showCloseButton className='w-[400px]'>
        <DialogHeader>
          <DialogHeaderTitle>Delete widget '{widgetTitle}'</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='p-5 text-sm font-normal'>
          Are you sure you want to delete this widget? This action cannot be undone.
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
            onClick={handleDeleteWidget}
            isLoading={isDeletingWidget}
            className='w-14'
            data-testid={`${widgetId}-delete-widget-dialog-delete-btn`}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteWidgetDialog;
