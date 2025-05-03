import React from 'react';
import { cn } from '../../lib/utils';
import { Ellipsis } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';

interface ListCardProps extends React.HTMLAttributes<HTMLDivElement> {
  header: React.ReactNode;
  children: React.ReactNode;
  dropdownOptions?: React.ReactNode[];
}

export const ListCard = ({ header, children, className, dropdownOptions, ...props }: ListCardProps) => {
  return (
    <div className={cn('rounded-md border border-gray-400', className)} {...props}>
      <div className='py-2 px-3 flex items-center justify-between bg-BG_GRAY_2 rounded-t-md'>
        <div>{header}</div>
        {dropdownOptions && dropdownOptions?.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Ellipsis size={14} className='cursor-pointer' />
            </DropdownMenuTrigger>
            <DropdownMenuContent className='z-[1001] max-h-60 overflow-y-auto' align='end'>
              {dropdownOptions.map((option, index) => (
                <DropdownMenuItem className='hover:bg-gray-100 rounded-md'>{option}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div className='p-3'>{children}</div>
    </div>
  );
};
