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
  DialogTrigger,
} from '@zamp-platform/ui';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import useDeleteFilter from 'modules/sheets/CreateEditFilter/useDeleteFilter';
import { defaultFnType } from '@/types/commonTypes';

interface DeleteFilterDialogProps {
  onClose: defaultFnType;
}

const DeleteFilterDialog: FC<DeleteFilterDialogProps> = ({ onClose }) => {
  const { isOpen, setIsOpen, handleDeleteFilter, isLoading, formData } = useDeleteFilter(onClose);

  if (!formData?.id) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant='destructive-outline'
          size='small'
          className='flex w-21 items-center gap-1'
          data-testid={`${formData?.id}-delete-filter-btn`}
        >
          <SvgSpriteLoader id='trash-04' size={14} />
          <span>Delete</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        size='small'
        showCloseButton
        className='!rounded-3.5 w-[400px]'
        closeButtonClassName='top-5 right-5'
      >
        <DialogHeader className='h-10 border-none px-5 pt-5'>
          <DialogHeaderTitle>Delete</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-13-400 px-5 py-6'>Are you sure you want to delete?</DialogBody>
        <DialogFooter className='flex justify-end gap-2.5 px-5'>
          <DialogClose asChild>
            <Button variant='secondary' size='medium'>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant='destructive'
            size='medium'
            onClick={handleDeleteFilter}
            className='w-14'
            isLoading={isLoading}
            data-testid={`${formData?.id}-delete-filter-dialog-delete-btn`}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteFilterDialog;
