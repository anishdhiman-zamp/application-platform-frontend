'use client';

import * as React from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { ChevronRight, Circle } from 'lucide-react';

import { cn } from '@zamp-platform/ui/utils';
import { Checkbox } from './checkbox';

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = ContextMenuPrimitive.Group;

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = ({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) => (
  <ContextMenuPrimitive.SubTrigger
    className={cn(
      'f-14-500 focus:bg-accent data-[state=open]:bg-accent flex cursor-default items-center rounded-sm px-2 py-1.5 outline-hidden select-none',
      inset && 'pl-8',
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className='ml-auto h-4 w-4' />
  </ContextMenuPrimitive.SubTrigger>
);
ContextMenuSubTrigger.displayName = ContextMenuPrimitive.SubTrigger.displayName;

const ContextMenuSubContent = ({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) => (
  <ContextMenuPrimitive.SubContent
    className={cn(
      'bg-BG_WHITE text-GRAY_1000 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[120px] overflow-hidden rounded-md border p-1 shadow-lg',
      className,
    )}
    {...props}
  />
);
ContextMenuSubContent.displayName = ContextMenuPrimitive.SubContent.displayName;

const ContextMenuContent = ({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Content>) => (
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      className={cn(
        'border-border bg-BG_WHITE shadow-menu-shadow data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[120px] rounded-[6px] border p-1',
        className,
      )}
      {...props}
    />
  </ContextMenuPrimitive.Portal>
);
ContextMenuContent.displayName = ContextMenuPrimitive.Content.displayName;

const ContextMenuItem = ({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  inset?: boolean;
}) => (
  <ContextMenuPrimitive.Item
    className={cn(
      'text-GRAY_900 f-12-500 font-inter flex cursor-pointer items-center gap-[6px] gap-x-4 self-stretch px-[10px] py-[8px] outline-hidden',
      inset && 'pl-8',
      className,
    )}
    {...props}
  />
);
ContextMenuItem.displayName = ContextMenuPrimitive.Item.displayName;

const ContextMenuCheckboxItem = ({
  className,
  children,
  checked,
  onSelect,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) => (
  <ContextMenuPrimitive.CheckboxItem
    className={cn(
      'f-12-500 focus:text-accent-GRAY_1000 hover:bg-accent focus:bg-accent data-[state=open]:bg-accent pointer-events-auto relative flex cursor-pointer items-center justify-between gap-x-2 rounded-sm px-2 py-1.5 outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50',
      className,
    )}
    checked={checked}
    onSelect={(event) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect?.(event);
    }}
    {...props}
  >
    {children}
    <Checkbox checked={checked} />
  </ContextMenuPrimitive.CheckboxItem>
);
ContextMenuCheckboxItem.displayName = ContextMenuPrimitive.CheckboxItem.displayName;

const ContextMenuRadioItem = ({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) => (
  <ContextMenuPrimitive.RadioItem
    className={cn(
      'f-12-500 focus:text-accent-GRAY_1000 hover:bg-accent focus:bg-accent data-[state=open]:bg-accent pointer-events-auto relative flex cursor-pointer items-center justify-between gap-x-2 rounded-sm px-2 py-1.5 outline-hidden transition-colors select-none data-disabled:pointer-events-none data-disabled:opacity-50',
      className,
    )}
    value={value}
    {...props}
  >
    {children}
    <div className='border-GRAY_400 hover:bg-GRAY_100 flex h-4 w-4 items-center justify-center rounded-full border'>
      <ContextMenuPrimitive.ItemIndicator>
        <Circle className='h-2 w-2 fill-current' />
      </ContextMenuPrimitive.ItemIndicator>
    </div>
  </ContextMenuPrimitive.RadioItem>
);
ContextMenuRadioItem.displayName = ContextMenuPrimitive.RadioItem.displayName;

const ContextMenuLabel = ({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Label> & {
  inset?: boolean;
}) => <ContextMenuPrimitive.Label className={cn('f-14-500 px-2 py-1.5', inset && 'pl-8', className)} {...props} />;
ContextMenuLabel.displayName = ContextMenuPrimitive.Label.displayName;

const ContextMenuSeparator = ({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) => (
  <ContextMenuPrimitive.Separator className={cn('bg-muted -mx-1 my-1 h-px', className)} {...props} />
);
ContextMenuSeparator.displayName = ContextMenuPrimitive.Separator.displayName;

const ContextMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn('f-12-500 ml-auto tracking-widest opacity-60', className)} {...props} />;
};
ContextMenuShortcut.displayName = 'ContextMenuShortcut';

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
