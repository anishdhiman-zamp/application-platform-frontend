import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@zamp-platform/ui/lib/utils';

const tagVariants = cva(
  'inline-flex justify-center items-center rounded-sm py-[2.5px] px-[6px] f-12-450 border gap-1 select-none',
  {
    variants: {
      variant: {
        default: 'bg-GRAY_100 text-black border-GRAY_200',
        blue: 'bg-blue-150 text-BLUE_800 border-BLUE_300',
        yellow: 'bg-yellow-100 text-ORANGE_900 border-ORANGE_300',
        green: 'bg-green-150 text-GREEN_900 border-GREEN_300',
        outline: 'bg-white text-black border-GRAY_300',
        ghost: 'bg-transparent text-black border-transparent',
        pink: 'bg-pink-100 text-[#c2185b] border-[#ffb6d5]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface TagProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tagVariants> {}

export const Tag = React.forwardRef<HTMLDivElement, TagProps>(({ className, variant, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn(tagVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
});
Tag.displayName = 'Tag';

export { tagVariants };
