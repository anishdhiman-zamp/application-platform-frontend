'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from '@zamp-platform/ui/utils';

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot='checkbox'
      className={cn(
        'border-GRAY_500 hover:bg-GRAY_400 focus-visible:ring-ring data-[state=checked]:bg-GRAY_1000 data-[state=checked]:border-GRAY_600 peer h-3.5 w-3.5 shrink-0 cursor-pointer rounded-[3px] border focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
        <Check className='text-GRAY_1000 h-[10px] w-[10px]' />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
