import React from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { X } from 'lucide-react';

interface StepCardProps extends React.HTMLAttributes<HTMLDivElement> {
  stepNumber: number;
  children: React.ReactNode;
  onRemove?: () => void;
}

export const StepCard = ({ stepNumber, children, className, onRemove, ...props }: StepCardProps) => {
  return (
    <div
      className={cn(
        'group/step-card relative flex items-start rounded-lg border-[0.5px] border-gray-500 bg-white',
        className,
      )}
      {...props}
    >
      {onRemove && (
        <div
          className='absolute -top-2.5 -right-2.5 z-1 h-5 w-5 cursor-pointer rounded-full border bg-white p-[2px] opacity-0 transition-opacity duration-300 group-hover/step-card:opacity-100'
          onClick={onRemove}
        >
          <X className='h-3.5 w-3.5 text-gray-900' />
        </div>
      )}
      <div className='absolute top-0 left-0 h-full w-6 rounded-l-lg bg-gray-100'>
        <div className='bg-primary f-12-500 flex h-6 w-6 items-center justify-center rounded-tl-lg text-white'>
          {stepNumber}
        </div>
      </div>
      <div className='ml-6 flex-1 p-5'>{children}</div>
    </div>
  );
};
