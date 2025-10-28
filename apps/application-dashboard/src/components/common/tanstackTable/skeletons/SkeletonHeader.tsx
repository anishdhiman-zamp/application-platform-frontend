import React from 'react';
import { cn } from '@/utils/common';
import SkeletonElement from 'components/common/skeletons/SkeletonElement';

interface ISkeletonHeaderProps {
  columnsWidth?: number[];
  className?: string;
}

const SkeletonHeader = ({ columnsWidth = [30, 30, 30], className }: ISkeletonHeaderProps) => {
  return (
    <tr className={cn('flex w-fit justify-start gap-4 py-2 pl-2', className)}>
      {Array.from({ length: columnsWidth.length }).map((_, idx) => (
        <td key={`skeleton-header-${idx}`} className='flex'>
          <SkeletonElement
            className='h-3.5 w-fit rounded-sm bg-gray-200'
            style={{ width: `${columnsWidth?.[idx]}px` }}
          />
        </td>
      ))}
    </tr>
  );
};

export default SkeletonHeader;
