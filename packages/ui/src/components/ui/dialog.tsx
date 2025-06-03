'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@zamp-platform/ui/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const dialogVariants = cva(
  'fixed left-[50%] top-[50%] z-1001 flex translate-x-[-50%] translate-y-[-50%] flex-col rounded-lg bg-white shadow-lg duration-200 max-h-[60vh]',
  {
    variants: {
      size: {
        large: 'w-[80vw]',
        medium: 'w-[60vw]',
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

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'z-1001 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 bg-black/20',
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
    className?: string;
    children?: React.ReactNode;
    title?: string;
    description?: string;
  } & VariantProps<typeof dialogVariants>
>(({ className, children, showCloseButton = false, title, description, size, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay onClick={(e) => e.stopPropagation()} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        dialogVariants({ size }),
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
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
        <DialogClose className='ring-offset-background focus:outline-hidden focus:ring-ring z-1002 absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none'>
          <X className='h-4 w-4' />
          <span className='sr-only'>Close</span>
        </DialogClose>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
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
  <div className={cn('border-GRAY_400 mt-auto shrink-0 border-t px-6 py-4', className)} {...props} />
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
