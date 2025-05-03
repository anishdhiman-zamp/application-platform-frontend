const ApprovalSkeleton = () => {
  return (
    <div className='flex flex-col gap-4'>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className='flex rounded-lg overflow-hidden border border-GRAY_500  h-[100px] w-full'>
          <div className='bg-GRAY_100'>
            <div className='bg-GRAY_1000 f-12-500  flex items-center justify-center h-6 w-6 text-white'>
              <div className='h-4 w-2 rounded-md bg-BG_GRAY_1 opacity-40' />
            </div>
          </div>
          <div className='p-5 w-full'>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index}>
                <div className='f-12-500 text-GRAY_700 capitalize mb-1.5 h-4 w-10 animate-pulse rounded-md bg-GRAY_200' />
                <div className='flex flex-wrap gap-1.5 '>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className='h-4 w-10 animate-pulse rounded-md bg-GRAY_200' />
                  ))}
                </div>
                {index !== 2 && (
                  <div className='flex items-center gap-1.5 my-4 f-11-600 text-GRAY_1000'>
                    <div className='h-4 w-10 animate-pulse rounded-md bg-GRAY_200' />
                    <div className='border-dashed border-GRAY_400 border-b w-full ' />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovalSkeleton;
