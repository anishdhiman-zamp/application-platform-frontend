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
        'flex items-start rounded-lg border-[0.5px] border-gray-500 bg-white relative group/step-card',
        className,
      )}
      {...props}
    >
      {onRemove && (
        <div
          className='absolute -right-2.5 -top-2.5 z-1 border rounded-full p-[2px] w-5 h-5 bg-white opacity-0 group-hover/step-card:opacity-100 transition-opacity duration-300 cursor-pointer'
          onClick={onRemove}
        >
          <X className='h-3.5 w-3.5 text-gray-900' />
        </div>
      )}
      <div className='bg-gray-100 w-6 h-full absolute left-0 top-0 rounded-l-lg'>
        <div className='flex items-center justify-center h-6 w-6 bg-primary text-white rounded-tl-lg f-12-500'>
          {stepNumber}
        </div>
      </div>
      <div className='ml-6 flex-1 p-5'>{children}</div>
    </div>
  );
};
