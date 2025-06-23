import SkeletonElement from 'components/skeletons/SkeletonElement';

const WhoHasAccessSkeletonLoader = ({ count = 5 }: { count?: number }) => {
  return (
    <div className='flex h-full w-full flex-col px-2 transition duration-700 ease-in-out'>
      {Array.from({ length: count }).map((_, index) => (
        <div key={`skeleton-${index}`} className='my-3 flex items-center justify-between'>
          <SkeletonElement className='bg-GRAY_50 h-4 w-32 rounded-md' />
          <SkeletonElement className='bg-GRAY_50 h-4 w-16 rounded-md' />
        </div>
      ))}
    </div>
  );
};

export default WhoHasAccessSkeletonLoader;
