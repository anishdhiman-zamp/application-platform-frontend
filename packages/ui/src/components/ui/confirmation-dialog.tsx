'use client';

import * as React from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { Button, type ButtonVariant } from './button';
import { Dialog, DialogClose, DialogContent } from './dialog';

type ConfirmationVariant = Extract<ButtonVariant, 'destructive' | 'default'>;

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ConfirmationVariant;
  isLoading?: boolean;
  disabled?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmButtonClassName?: string;
  confirmButtonTestId?: string;
  contentId?: string;
  contentClassName?: string;
  contentDataSlot?: string;
  overlayClassName?: string;
}

const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'destructive',
  isLoading,
  disabled,
  onConfirm,
  onCancel,
  confirmButtonClassName,
  confirmButtonTestId,
  contentId,
  contentClassName,
  contentDataSlot,
  overlayClassName,
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size='small'
        className={cn('border-GRAY_400 max-h-fit w-[400px] rounded-[14px] border', contentClassName)}
        id={contentId}
        data-slot={contentDataSlot}
        dialogueOverlayClassName={overlayClassName}
      >
        <div className='px-5 pt-5'>
          <DialogClose className='absolute top-4 right-4 cursor-pointer text-gray-500 hover:text-gray-700'>
            <span className='text-xl leading-none'>&times;</span>
          </DialogClose>

          <h2 className='f-16-600 text-GRAY_1000 mb-4'>{title}</h2>
          <div className='f-13-400 text-GRAY_700 mb-4'>{description}</div>
        </div>

        <div className='border-GRAY_400 flex justify-end gap-3 border-t px-5 py-4'>
          <Button
            variant='outline'
            size='medium'
            className='px-3.5 py-2'
            onClick={onCancel ?? (() => onOpenChange(false))}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size='medium'
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={disabled}
            className={cn('px-3.5 py-2', confirmButtonClassName)}
            data-testid={confirmButtonTestId}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { ConfirmationDialog };
export type { ConfirmationDialogProps };
