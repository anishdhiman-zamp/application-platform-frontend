'use client';

import * as React from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { Button, type ButtonVariant } from './button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogHeaderTitle,
} from './dialog';

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
}: ConfirmationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size='small'
        showCloseButton
        className={cn('w-[400px]', contentClassName)}
        id={contentId}
        data-slot={contentDataSlot}
      >
        <DialogHeader>
          <DialogHeaderTitle>{title}</DialogHeaderTitle>
        </DialogHeader>
        <DialogBody className='f-14-400 p-5'>{description}</DialogBody>
        <DialogFooter className='flex justify-end gap-2.5'>
          <DialogClose asChild>
            <Button variant='secondary' size='medium' onClick={onCancel}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <Button
            variant={confirmVariant}
            size='medium'
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={disabled}
            className={confirmButtonClassName}
            data-testid={confirmButtonTestId}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ConfirmationDialog };
export type { ConfirmationDialogProps };
