'use client';

import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cn } from '@zamp-platform/ui/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { ComponentPropsWithRef } from 'react';

const toggleVariants = cva(
  'inline-flex items-center justify-center gap-1 rounded-full text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'border border-dashed border-GRAY_600 text-GRAY_600 hover:border-GRAY_900 hover:text-GRAY_900 data-[state=on]:border-solid data-[state=on]:border-GRAY_1000 data-[state=on]:bg-GRAY_100 data-[state=on]:text-GRAY_1000',
        outline:
          'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
      },
      size: {
        default: 'h-7 px-2.5 f-11-500',
        sm: 'h-6 px-2 f-11-500',
        lg: 'h-8 px-3 f-12-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Toggle({
  ref,
  className,
  variant,
  size,
  ...props
}: ComponentPropsWithRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props} />;
}

export { Toggle, toggleVariants };
