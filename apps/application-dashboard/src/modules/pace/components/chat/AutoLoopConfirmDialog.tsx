'use client';

import { type FC, useCallback } from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
} from '@zamp-platform/ui';

interface AutoLoopConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const AutoLoopConfirmDialog: FC<AutoLoopConfirmDialogProps> = ({ isOpen, onOpenChange, onConfirm }) => {
  const handleConfirm = useCallback(() => {
    onOpenChange(false);
    onConfirm();
  }, [onOpenChange, onConfirm]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent size='small' showCloseButton className='w-[400px] outline-none'>
        <DialogHeader>
          <DialogHeaderTitle>Enable Autopilot</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-14-400 p-5'>
          This will switch the conversation to Autopilot mode. Once enabled, it stays on for the rest of this chat and
          cannot be turned off. You can start a new conversation at any time to go back to the default mode.
        </DialogBody>
        <DialogFooter className='flex justify-end gap-2.5'>
          <DialogClose asChild>
            <Button variant='secondary' size='medium'>
              Cancel
            </Button>
          </DialogClose>
          <Button size='medium' onClick={handleConfirm}>
            Enable
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AutoLoopConfirmDialog;
