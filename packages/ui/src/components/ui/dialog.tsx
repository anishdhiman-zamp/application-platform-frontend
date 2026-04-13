'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@zamp-platform/ui/utils';
import { cva } from 'class-variance-authority';

const dialogVariants = cva(
  'fixed left-[50%] top-[50%] z-1001 flex translate-x-[-50%] translate-y-[-50%] flex-col rounded-lg bg-BG_WHITE text-GRAY_1000 shadow-lg duration-200 max-h-[60vh] outline-none',
  {
    variants: {
      size: {
        large: 'w-[80vw]',
        medium: 'w-[60vw]',
        medium_small: 'w-[50vw]',
        small: 'w-[40vw]',
      },
    },
    defaultVariants: {
      size: 'medium',
    },
  },
);

const Dialog = ({ ...props }: DialogPrimitive.DialogProps) => <DialogPrimitive.Root {...props} />;

const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = ({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay
    className={cn(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 bg-GRAY_70 fixed inset-0 z-1001 backdrop-blur-[4px]',
      className,
    )}
    {...props}
  />
);
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = ({
  className,
  children,
  showCloseButton = false,
  title,
  description,
  size,
  dialogueOverlayClassName,
  closeButtonClassName,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  title?: string;
  description?: string;
  size?: 'large' | 'medium' | 'medium_small' | 'small';
  dialogueOverlayClassName?: string;
  closeButtonClassName?: string;
}) => (
  <DialogPortal>
    <DialogOverlay onClick={(e) => e.stopPropagation()} className={dialogueOverlayClassName} />
    <DialogPrimitive.Content
      className={cn(
        dialogVariants({ size }),
        'border-GRAY_400 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-center data-[state=open]:slide-in-from-center border',
        className,
      )}
      onCloseAutoFocus={(event) => {
        event.preventDefault();
        if (typeof window !== 'undefined' && window.document) {
          window.document.body.style.pointerEvents = '';
        }
      }}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
      }}
      {...props}
    >
      <DialogPrimitive.Title className='sr-only'>{title || 'Dialog'}</DialogPrimitive.Title>
      <DialogPrimitive.Description className='sr-only'>{description || 'Dialog content'}</DialogPrimitive.Description>
      {children}
      {showCloseButton && (
        <DialogClose
          className={cn(
            'absolute top-4 right-4 z-1002 cursor-pointer rounded-sm opacity-70 transition-opacity outline-none hover:opacity-100 focus:outline-hidden disabled:pointer-events-none',
            closeButtonClassName,
          )}
        >
          <X className='h-4 w-4' />
          <span className='sr-only'>Close</span>
        </DialogClose>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('border-GRAY_400 flex h-14 shrink-0 items-center justify-between border-b px-4', className)}
    {...props}
  />
);
DialogHeader.displayName = 'DialogHeader';

const DialogHeaderTitle = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('text-GRAY_1000 text-base font-semibold', className)} {...props} />
);
DialogHeaderTitle.displayName = 'DialogHeaderTitle';

const DialogHeaderActions = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center gap-2', className)} {...props} />
);
DialogHeaderActions.displayName = 'DialogHeaderActions';

const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 overflow-y-auto rounded-b-lg', className)} {...props} />
);
DialogBody.displayName = 'DialogBody';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('border-GRAY_400 mt-auto flex shrink-0 items-center justify-end gap-3 border-t px-6 py-4', className)}
    {...props}
  />
);
DialogFooter.displayName = 'DialogFooter';

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogHeaderTitle,
  DialogHeaderActions,
  DialogBody,
  DialogFooter,
  DialogClose,
};
