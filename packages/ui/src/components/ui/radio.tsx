'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';

import { cn } from '@zamp-platform/ui/utils';

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const Radio = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.RadioGroupItem>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.RadioGroupItem>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.RadioGroupItem
      ref={ref}
      className={cn(
        'text-gray-1000 ring-offset-background focus:outline-hidden focus-visible:ring-ring aspect-square h-3.5 w-3.5 rounded-full border border-gray-400 focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className='flex items-center justify-center'>
        <Circle className='h-2 w-2 fill-current text-current' />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.RadioGroupItem>
  );
});
Radio.displayName = RadioGroupPrimitive.RadioGroupItem.displayName;

export { Radio, RadioGroup };
