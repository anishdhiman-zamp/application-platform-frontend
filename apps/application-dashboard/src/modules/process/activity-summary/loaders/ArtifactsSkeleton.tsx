import SkeletonElement from '@/components/skeletons/SkeletonElement';

const ArtifactsSkeleton = () => {
  return (
    <>
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className='flex flex-col gap-y-2'>
          <SkeletonElement className='h-4 rounded bg-GRAY_400 w-1/3' />
          <SkeletonElement className='h-4 rounded bg-GRAY_400 w-1/2' />
          <SkeletonElement className='h-4 rounded bg-GRAY_400 w-2/5' />
        </div>
      ))}
    </>
  );
};

export default ArtifactsSkeleton;
