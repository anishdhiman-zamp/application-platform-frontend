import { Slot } from '@radix-ui/react-slot';
import { cn } from '@zamp-platform/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';
import { SIZE_TYPES } from '../../types';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-secondary hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-transparent text-primary border border-gray-400 hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 py-3 px-4 f-14-500',
        [SIZE_TYPES.LARGE]: 'h-10 py-3 px-4 f-14-500',
        [SIZE_TYPES.MEDIUM]: 'h-8 px-2 py-2 f-13-500',
        [SIZE_TYPES.SMALL]: 'h-7 px-3 f-12-500',
        [SIZE_TYPES.XSMALL]: 'h-6 px-0.5 py-1 f-11-500',
        [SIZE_TYPES.XXSMALL]: 'h-5 rounded-sm px-0.5 py-1 f-11-500',
        icon: 'h-10 w-10',
        xs: 'h-[26px] rounded-md px-2.5 py-1.5 f-11-500',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? <Loader2 className='animate-spin' /> : children}
      </Comp>
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
