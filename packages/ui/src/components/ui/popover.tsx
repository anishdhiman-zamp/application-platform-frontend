import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as React from 'react';
import { cn } from '../../lib/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverPortal = PopoverPrimitive.Portal;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  return (
    <PopoverPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-[1003] min-w-[120px] rounded-[6px] border border-GRAY_400 bg-white p-1 shadow-menuShadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const PopoverMenuItem = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center gap-[6px] gap-x-4 px-[10px] py-[8px] self-stretch cursor-pointer outline-none text-GRAY_900 f-12-500 font-inter',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
));
PopoverMenuItem.displayName = 'PopoverMenuItem';

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent, PopoverPortal, PopoverMenuItem };
