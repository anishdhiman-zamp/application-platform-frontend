import React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@zamp-platform/ui/utils';

const switchVariants = cva(
  'focus-visible:ring-ring focus-visible:ring-offset-background peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-40 data-[state=checked]:bg-gray-1000 data-[state=unchecked]:bg-GRAY_600',
  {
    variants: {
      size: {
        default: 'h-5 w-9',
        small: 'h-3 w-5',
        medium: 'h-3.5 w-6',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

const thumbVariants = cva(
  'bg-background pointer-events-none block rounded-full shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0',
  {
    variants: {
      size: {
        default: 'h-4 w-4 data-[state=checked]:translate-x-4',
        small: 'h-2 w-2 data-[state=checked]:translate-x-2',
        medium: 'h-2.5 w-2.5 data-[state=checked]:translate-x-2.5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

export interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitives.Root>, VariantProps<typeof switchVariants> {
  thumbClassName?: string;
}

const Switch = React.forwardRef<React.ComponentRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, size, thumbClassName, ...props }, ref) => (
    <SwitchPrimitives.Root className={cn(switchVariants({ size, className }))} {...props} ref={ref}>
      <SwitchPrimitives.Thumb className={cn(thumbVariants({ size }), thumbClassName)} />
    </SwitchPrimitives.Root>
  ),
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
