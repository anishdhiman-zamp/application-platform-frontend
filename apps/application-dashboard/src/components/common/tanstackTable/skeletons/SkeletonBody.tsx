import React from 'react';
import { cn } from '@/utils/common';
import SkeletonElement from 'components/common/skeletons/SkeletonElement';

interface ISkeletonBodyProps {
  columnsWidth?: number[];
  className?: string;
  rowCount?: number;
}

const SkeletonBody = ({ columnsWidth = [30, 30, 30], className, rowCount = 20 }: ISkeletonBodyProps) => {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, rowIdx) => (
        <tr
          key={`skeleton-row-${rowIdx}`}
          className={cn('absolute flex h-10 w-fit justify-start gap-4 py-2 pl-2', className)}
          style={{
            transform: `translateY(${rowIdx * 40}px)`,
          }}
        >
          {Array.from({ length: columnsWidth.length }).map((_, idx) => (
            <td key={`skeleton-cell-${rowIdx}-${idx}`} className='flex'>
              <SkeletonElement
                className='h-3.5 w-fit rounded-sm bg-gray-200'
                style={{ width: `${columnsWidth?.[idx]}px` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
};

export default SkeletonBody;
