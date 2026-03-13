'use client';

import * as SheetPrimitive from '@radix-ui/react-dialog';
import { cn } from '@zamp-platform/ui/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import * as React from 'react';
import { useEffect, useState } from 'react';

export const SHEET_ANIMATION_DURATION = 300;

interface SheetProps extends React.ComponentProps<typeof SheetPrimitive.Root> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void; // eslint-disable-line no-unused-vars
}

const Sheet = ({ onOpenChange, open, ...props }: SheetProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open !== undefined) {
      setIsAnimating(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before setting isOpen to false
      setTimeout(() => {
        if (onOpenChange) {
          onOpenChange(false);
        }
      }, SHEET_ANIMATION_DURATION);
    }
  };

  return <SheetPrimitive.Root open={isAnimating} onOpenChange={handleOpenChange} {...props} />;
};
Sheet.displayName = SheetPrimitive.Root.displayName;

const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = ({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) => (
  <SheetPrimitive.Overlay
    className={cn(
      `data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-1001 bg-black/20 duration-[${SHEET_ANIMATION_DURATION}ms]!`,
      className,
    )}
    {...props}
  />
);
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  `fixed bg-BG_WHITE shadow-MENU_SHADOW transition-all duration-[${SHEET_ANIMATION_DURATION}ms]! ease-in-out flex flex-col rounded-lg m-4 z-1001 h-[calc(100vh-2rem)]!`,
  {
    variants: {
      side: {
        right:
          'inset-y-0 right-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
        left: 'inset-y-0 left-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        top: 'inset-x-0 top-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
      },
      size: {
        large: 'w-[600px]',
        medium: 'w-[450px]',
      },
    },
    defaultVariants: {
      side: 'right',
      size: 'medium',
    },
  },
);

interface SheetContentProps
  extends React.ComponentProps<typeof SheetPrimitive.Content>, VariantProps<typeof sheetVariants> {
  showCloseButton?: boolean;
  className?: string;
  children?: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'large' | 'medium';
}

const SheetContent = ({
  side = 'right',
  size = 'medium',
  className,
  children,
  showCloseButton = false,
  title,
  description,
  ...props
}: SheetContentProps) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content className={cn(sheetVariants({ side, size }), className)} {...props}>
      <SheetPrimitive.Title className='sr-only'>{title || 'Sheet'}</SheetPrimitive.Title>
      <SheetPrimitive.Description className='sr-only'>{description || 'Sheet content'}</SheetPrimitive.Description>
      {children}
      {showCloseButton && (
        <SheetPrimitive.Close className='ring-offset-background focus:ring-ring data-[state=open]:bg-GRAY_1000 absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none'>
          <X className='h-4 w-4' />
          <span className='sr-only'>Close</span>
        </SheetPrimitive.Close>
      )}
    </SheetPrimitive.Content>
  </SheetPortal>
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex h-14 items-center justify-between border-b px-4', className)} {...props} />
);
SheetHeader.displayName = 'SheetHeader';

const SheetHeaderTitle = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('text-base font-semibold', className)} {...props} />
);
SheetHeaderTitle.displayName = 'SheetHeaderTitle';

const SheetHeaderActions = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center gap-2', className)} {...props} />
);
SheetHeaderActions.displayName = 'SheetHeaderActions';

const SheetBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex-1 overflow-auto rounded-b-lg bg-slate-50 p-4', className)} {...props} />
);
SheetBody.displayName = 'SheetBody';

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetHeaderActions,
  SheetHeaderTitle,
  SheetOverlay,
  SheetPortal,
  SheetTrigger,
};
