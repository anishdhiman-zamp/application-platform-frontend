import React from 'react';
import { cn } from '../../lib/utils';

interface ListCardProps extends React.HTMLAttributes<HTMLDivElement> {
  header: React.ReactNode;
  children: React.ReactNode;
  dropdownOptions?: React.ReactNode[];
  rightComponent?: React.ReactNode;
}

export const ListCard = ({ header, children, className, dropdownOptions, rightComponent, ...props }: ListCardProps) => {
  return (
    <div className={cn('cursor-pointer rounded-md border border-gray-400', className)} {...props}>
      <div className='py-2 px-3 flex items-center justify-between bg-BG_GRAY_2 rounded-t-md'>
        <div>{header}</div>
        {rightComponent}
      </div>
      <div className='p-3'>{children}</div>
    </div>
  );
};
