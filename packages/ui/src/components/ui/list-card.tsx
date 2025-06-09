import React from 'react';
import { cn } from '@zamp-platform/ui/utils';

interface ListCardProps extends React.HTMLAttributes<HTMLDivElement> {
  header: React.ReactNode;
  children: React.ReactNode;
  rightComponent?: React.ReactNode;
}

export const ListCard = ({ header, children, className, rightComponent, ...props }: ListCardProps) => {
  return (
    <div className={cn('w-full cursor-pointer rounded-md border border-gray-400', className)} {...props}>
      <div className='bg-BG_GRAY_2 flex items-center justify-between rounded-t-md px-3 py-2'>
        <div>{header}</div>
        {rightComponent}
      </div>
      <div className='p-3'>{children}</div>
    </div>
  );
};
