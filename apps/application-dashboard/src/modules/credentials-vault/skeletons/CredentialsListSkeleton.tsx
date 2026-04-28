import { Skeleton } from '@zamp-platform/ui';

const DEFAULT_CARD_COUNT = 3;
const DEFAULT_KEYS_PER_CARD = 2;

interface CredentialsListSkeletonPropsType {
  cardCount?: number;
  keysPerCard?: number;
}

const CredentialsListSkeleton = ({
  cardCount = DEFAULT_CARD_COUNT,
  keysPerCard = DEFAULT_KEYS_PER_CARD,
}: CredentialsListSkeletonPropsType) => (
  <div className='flex w-full flex-col gap-4'>
    {Array.from({ length: cardCount }).map((_, cardIdx) => (
      <div key={cardIdx} className='border-GRAY_400 bg-BG_WHITE flex flex-col overflow-hidden rounded-xl border px-6'>
        <div className='flex items-center justify-between pt-5.5 pb-3.5'>
          <Skeleton className='h-4 w-32' />
          <div className='flex items-center gap-2'>
            <Skeleton className='h-6 w-6 rounded-md' />
            <Skeleton className='h-6 w-6 rounded-md' />
          </div>
        </div>
        <div className='border-GRAY_400 flex items-center border-b py-3.5'>
          <Skeleton className='h-3 w-16' />
        </div>
        <div className='flex flex-col'>
          {Array.from({ length: keysPerCard }).map((_, rowIdx) => (
            <div key={rowIdx} className='flex items-center justify-between gap-4 py-3'>
              <div className='min-w-0 flex-1'>
                <Skeleton className='h-4 w-3/4 max-w-40' />
              </div>
              <div className='flex min-w-0 flex-1 items-center justify-between gap-2'>
                <Skeleton className='h-4 w-3/4 max-w-48' />
                <div className='flex shrink-0 items-center gap-2'>
                  <Skeleton className='h-6 w-6 rounded-md' />
                  <Skeleton className='h-6 w-6 rounded-md' />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default CredentialsListSkeleton;
