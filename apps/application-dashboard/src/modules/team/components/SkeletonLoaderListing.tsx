import React, { FC } from 'react';
import SkeletonElement from 'components/skeletons/SkeletonElement';

type SkeletonLoaderListingPropsType = {
  columns?: number;
  length?: number;
};

const SkeletonLoaderListing: FC<SkeletonLoaderListingPropsType> = ({ columns = 3, length = 3 }) => {
  return (
    <div className='flex flex-col gap-4'>
      {Array.from({ length: length }).map((_, index) => (
        <div
          key={index}
          className={`grid grid-cols-${columns} border-b-0.5 border-DIVIDER_GRAY h-10 w-full items-center gap-4`}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonElement key={colIndex} className='h-4 w-1/3 rounded-md' />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoaderListing;
