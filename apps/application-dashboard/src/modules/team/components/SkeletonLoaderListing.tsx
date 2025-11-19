import { FC } from 'react';
import SkeletonElement from 'components/skeletons/SkeletonElement';

type SkeletonLoaderListingPropsType = {
  columns?: number;
  length?: number;
};

const SkeletonLoaderListing: FC<SkeletonLoaderListingPropsType> = ({ columns = 3, length = 3 }) => {
  return (
    <div className='flex flex-col'>
      {Array.from({ length: length }).map((_, index) => (
        <div
          key={index}
          className={`grid grid-cols-${columns} border-DIVIDER_GRAY border-b-0.5 w-full items-center gap-4 py-4`}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonElement key={colIndex} className='h-4 w-full rounded-md' />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoaderListing;
