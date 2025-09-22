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
import { defaultFnType } from '@/types/commonTypes';

interface DiscardDialogProps {
  onClose: defaultFnType;
}

const DiscardDialog: FC<DiscardDialogProps> = ({ onClose }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='ghost' size='xxsmall'>
          <SvgSpriteLoader id='x-close' size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent
        size='small'
        showCloseButton
        className='!rounded-3.5 w-[400px]'
        closeButtonClassName='top-5 right-5'
      >
        <DialogHeader className='h-10 border-none px-5 pt-5'>
          <DialogHeaderTitle>Discard Filter</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-13-400 px-5 py-6'>Do you wish to proceed? All changes will be discarded.</DialogBody>
        <DialogFooter className='flex justify-end gap-2.5 px-5'>
          <Button variant='secondary' size='medium' onClick={onClose}>
            Yes
          </Button>
          <DialogClose asChild>
            <Button size='medium'>No</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiscardDialog;
