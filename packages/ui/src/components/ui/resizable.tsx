'use client';

import React from 'react';
import { cn } from '@zamp-platform/ui/utils';
import * as ResizablePrimitive from 'react-resizable-panels';
import {
  disableGlobalCursorStyles,
  ImperativePanelHandle,
  type ImperativePanelGroupHandle,
} from 'react-resizable-panels';

disableGlobalCursorStyles();

const ResizablePanelGroup = ({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn('flex h-full w-full data-[panel-group-direction=vertical]:flex-col', className)}
    {...props}
  />
);

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = ({
  withHandle,
  className,
  handleClassName,
  disabled,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean;
  handleClassName?: string;
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      'bg-GRAY_400 focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90',
      className,
    )}
    {...props}
  >
    {withHandle && !disabled && (
      <div className={cn('border-GRAY_500 absolute z-1000 h-10 w-2 rounded-full border bg-white', handleClassName)} />
    )}
  </ResizablePrimitive.PanelResizeHandle>
);

export {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  type ImperativePanelGroupHandle,
  type ImperativePanelHandle,
};
