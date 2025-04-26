import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';
import { SIZE_TYPES } from '../../types';

const inputVariants = cva(
  'p-3 flex w-full rounded-md border border-gray-400 placeholder:text-gray-700 focus:border-gray-600 focus:ring-2 focus:ring-gray-400 bg-white file:border-0 file:bg-transparent file:text-sm file:font-medium outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        [SIZE_TYPES.XLARGE]: 'h-14 f-17-400',
        [SIZE_TYPES.LARGE]: 'h-12 f-16-400',
        [SIZE_TYPES.MEDIUM]: 'h-10 f-14-400',
        [SIZE_TYPES.SMALL]: 'h-8 f-12-400',
        [SIZE_TYPES.XSMALL]: 'h-6 f-11-400',
        [SIZE_TYPES.XXSMALL]: 'h-4 f-10-400',
      },
      variant: {
        default: 'border-input',
        error: 'border-destructive',
      },
    },
    defaultVariants: {
      size: SIZE_TYPES.MEDIUM,
      variant: 'default',
    },
  },
);

export type IconPosition = 'leading' | 'trailing';

const sizeMap: Record<SIZE_TYPES, string> = {
  [SIZE_TYPES.XLARGE]: 'w-6 h-6',
  [SIZE_TYPES.LARGE]: 'w-6 h-6',
  [SIZE_TYPES.MEDIUM]: 'w-4 h-4',
  [SIZE_TYPES.SMALL]: 'w-4 h-4',
  [SIZE_TYPES.XSMALL]: 'w-3 h-3',
  [SIZE_TYPES.XXSMALL]: 'w-2 h-2',
};

const positionMap: Record<SIZE_TYPES, string> = {
  [SIZE_TYPES.XLARGE]: 'left-6',
  [SIZE_TYPES.LARGE]: 'left-6',
  [SIZE_TYPES.MEDIUM]: 'left-3',
  [SIZE_TYPES.SMALL]: 'left-3',
  [SIZE_TYPES.XSMALL]: 'left-2',
  [SIZE_TYPES.XXSMALL]: 'left-1.5',
};

const paddingMap: Record<SIZE_TYPES, string> = {
  [SIZE_TYPES.XLARGE]: 'pl-16 pr-4.5',
  [SIZE_TYPES.LARGE]: 'pl-16 pr-4.5',
  [SIZE_TYPES.MEDIUM]: 'pl-9 pr-2.5',
  [SIZE_TYPES.SMALL]: 'pl-9 pr-2',
  [SIZE_TYPES.XSMALL]: 'pl-6 pr-2',
  [SIZE_TYPES.XXSMALL]: 'pl-4 pr-1.5',
};

const getIconClasses = (size: SIZE_TYPES, position: IconPosition) => {
  const positionClass = position === 'leading' ? positionMap[size] : positionMap[size].replace('left', 'right');
  return `${positionClass} ${sizeMap[size]}`;
};

const getInputPadding = (size: SIZE_TYPES, position: IconPosition, hasIcon: boolean) => {
  if (!hasIcon) return '';
  return position === 'leading' ? paddingMap[size] : paddingMap[size].replace('pl-', 'pr-').replace('pr-', 'pl-');
};

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  icon?: React.ReactNode;
  iconPosition?: IconPosition;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = SIZE_TYPES.MEDIUM, variant, error, type, icon, iconPosition = 'leading', ...props }, ref) => {
    const currentSize = size || SIZE_TYPES.MEDIUM;

    return (
      <div className='relative flex items-center'>
        {icon && <div className={`absolute ${getIconClasses(currentSize, iconPosition)}`}>{icon}</div>}
        <input
          type={type}
          className={cn(
            inputVariants({ size: currentSize, variant: error ? 'error' : variant }),
            getInputPadding(currentSize, iconPosition, !!icon),
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input, inputVariants };
