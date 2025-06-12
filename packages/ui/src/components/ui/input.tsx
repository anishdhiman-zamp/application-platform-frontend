import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@zamp-platform/ui/utils';
import { SizeType } from '@zamp-platform/ui/types';

const inputVariants = cva(
  'p-3 flex w-full rounded-md border border-gray-400 placeholder:text-gray-700 focus:border-gray-600 focus:ring-2 focus:ring-gray-400 bg-white [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_1000px_white_inset] file:border-0 file:bg-transparent file:text-sm file:font-medium outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        xlarge: 'h-14 f-17-400',
        large: 'h-12 f-16-400',
        medium: 'h-10 f-14-400',
        small: 'h-8 f-12-400',
        xsmall: 'h-6 f-11-400',
        xxsmall: 'h-4 f-10-400',
      } satisfies Record<SizeType, string>,
      variant: {
        default: 'border-input',
        error: 'border-destructive',
      },
    },
    defaultVariants: {
      size: 'medium',
      variant: 'default',
    },
  },
);

export type IconPosition = 'leading' | 'trailing';

const sizeMap: Record<SizeType, string> = {
  xlarge: 'w-6 h-6',
  large: 'w-6 h-6',
  medium: 'w-4 h-4',
  small: 'w-4 h-4',
  xsmall: 'w-3 h-3',
  xxsmall: 'w-2 h-2',
};

const positionMap: Record<SizeType, string> = {
  xlarge: 'left-6',
  large: 'left-6',
  medium: 'left-3',
  small: 'left-3',
  xsmall: 'left-2',
  xxsmall: 'left-1.5',
};

const paddingMap: Record<SizeType, string> = {
  xlarge: 'pl-16 pr-4.5',
  large: 'pl-16 pr-4.5',
  medium: 'pl-9 pr-2.5',
  small: 'pl-9 pr-2',
  xsmall: 'pl-6 pr-2',
  xxsmall: 'pl-4 pr-1.5',
};

const getIconClasses = (size: SizeType, position: IconPosition) => {
  const positionClass = position === 'leading' ? positionMap[size] : positionMap[size].replace('left', 'right');
  return `${positionClass} ${sizeMap[size]}`;
};

const getInputPadding = (size: SizeType, position: IconPosition, hasIcon: boolean) => {
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

const Input = ({
  ref,
  className,
  size = 'medium',
  variant,
  error,
  type,
  icon,
  iconPosition = 'leading',
  wrapperClassName,
  ...props
}: InputProps & {
  ref?: React.RefCallback<HTMLInputElement>;
  wrapperClassName?: string;
}) => {
  const currentSize = size || 'medium';

  return (
    <div className={cn('relative flex items-center', wrapperClassName)}>
      {icon && <div className={`absolute ${getIconClasses(currentSize, iconPosition)}`}>{icon}</div>}
      <input
        type={type}
        className={cn(
          inputVariants({
            size: currentSize,
            variant: error ? 'error' : variant,
          }),
          getInputPadding(currentSize, iconPosition, !!icon),
          className,
        )}
        ref={ref}
        {...props}
      />
    </div>
  );
};
Input.displayName = 'Input';

export { Input, inputVariants };
