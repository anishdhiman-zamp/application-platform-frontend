import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@zamp-platform/ui/utils';

const tagVariants = cva(
  'inline-flex justify-center items-center rounded-sm py-[2.5px] px-[6px] f-12-450 border select-none border-transparent text-primary',
  {
    variants: {
      variant: {
        blue: 'bg-blue-150',
        yellow: 'bg-yellow-100',
        orange: 'bg-orange-200',
        green: 'bg-green-150',
        violet: 'bg-violet-100',
        outline: 'bg-transparent border-gray-400',
        ghost: 'bg-transparent',
        pink: 'bg-pink-100',
        gray: 'bg-gray-50 text-gray-900',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  },
);

export interface TagProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tagVariants> {}

export const Tag = ({ className, variant, children, ...props }: TagProps) => {
  return (
    <div className={cn(tagVariants({ variant }), className)} {...props}>
      {children}
    </div>
  );
};

Tag.displayName = 'Tag';

export { tagVariants };
