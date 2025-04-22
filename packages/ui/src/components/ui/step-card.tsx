import React from 'react';
import { cn } from '../../lib/utils';

interface StepCardProps extends React.HTMLAttributes<HTMLDivElement> {
  stepNumber: number;
  children: React.ReactNode;
}

export const StepCard = ({ stepNumber, children, className, ...props }: StepCardProps) => {
  return (
    <div
      className={cn('flex items-start rounded-[8px] border-[0.5px] border-gray-500 bg-white relative', className)}
      {...props}
    >
      <div className='bg-gray-100 w-6 h-full absolute left-0 top-0 rounded-l-[8px]'>
        <div className='flex items-center justify-center h-6 w-6 bg-primary text-white rounded-tl-[8px] f-12-500'>
          {stepNumber}
        </div>
      </div>
      <div className='ml-6 flex-1 p-5'>{children}</div>
    </div>
  );
};
