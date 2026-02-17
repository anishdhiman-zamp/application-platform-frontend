'use client';

import { Button, Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import React, { FC, useCallback, useEffect } from 'react';

interface UnsavedChangesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
  isCreating: boolean; // true for new dataset, false for updating existing dataset
}

const UnsavedChangesModal: FC<UnsavedChangesModalProps> = ({ open, onOpenChange, onSave, onDiscard, isCreating }) => {
  // Handle Enter key to trigger Save
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter' && open) {
        e.preventDefault();
        onSave();
      }
    },
    [open, onSave],
  );

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const title = isCreating ? 'Create dataset before leaving?' : 'Save changes before leaving?';
  const description = isCreating
    ? 'Do you want to create it now or discard your changes?'
    : 'You have unsaved changes to this dataset. Do you want to save them now or discard your changes?';
  const saveButtonText = isCreating ? 'Create dataset' : 'Save changes';
  const discardButtonText = isCreating ? 'Discard dataset' : 'Discard changes';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size='small'
        showCloseButton
        className='border-GRAY_400 w-[400px] rounded-[14px] border'
        closeButtonClassName='cursor-pointer'
      >
        <DialogHeader className='flex w-full flex-col items-start justify-start border-none px-5 pt-5 pb-0'>
          <span className='f-16-600 mb-1'>{title}</span>
          <span className='f-13-400 text-GRAY_700 leading-relaxed'>{description}</span>
        </DialogHeader>
        <DialogBody className={cn('border-none', isCreating ? 'pb-6' : 'pb-10')}></DialogBody>
        <DialogFooter className='flex gap-2.5 px-5 py-4'>
          <Button variant='outline' size='medium' className='px-3.5 py-2' onClick={onDiscard}>
            {discardButtonText}
          </Button>
          <Button size='medium' className='px-3.5 py-2' onClick={onSave}>
            {saveButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnsavedChangesModal;
