import { Skeleton } from '@zamp-platform/ui';

const UserMessageSkeleton = () => (
  <div className='flex flex-col items-start gap-1.5'>
    <div className='flex items-center gap-2'>
      <Skeleton className='h-5 w-5 rounded-full' />
      <Skeleton className='h-3 w-16 rounded' />
    </div>
    <Skeleton className='h-4 w-48 rounded' />
  </div>
);

const AssistantMessageSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className='flex flex-col gap-1.5'>
    <div className='flex items-center gap-2'>
      <Skeleton className='h-5 w-5 rounded-full' />
      <Skeleton className='h-3 w-12 rounded' />
    </div>
    <div className='ml-7 space-y-2'>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className='h-4 rounded' style={{ width: `${Math.max(40, 100 - index * 20)}%` }} />
      ))}
    </div>
  </div>
);

const ChatMessagesSkeleton = () => (
  <div className='flex w-full flex-col gap-6 px-3 py-4'>
    <UserMessageSkeleton />
    <AssistantMessageSkeleton lines={4} />
    <UserMessageSkeleton />
    <AssistantMessageSkeleton lines={2} />
  </div>
);

export default ChatMessagesSkeleton;
