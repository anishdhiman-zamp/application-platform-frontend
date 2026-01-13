import { Skeleton } from '@zamp-platform/ui';

const ChatHistoryItemSkeleton = () => (
  <div className='flex items-start gap-2.5 px-3 py-2.5'>
    <Skeleton className='h-4 w-4 flex-shrink-0 rounded' />
    <div className='min-w-0 flex-1'>
      <Skeleton className='h-4 w-full max-w-full rounded' />
    </div>
  </div>
);

const ChatHistorySkeleton = () => (
  <div className='w-full max-w-[700px]'>
    <div className='space-y-0.5'>
      {Array.from({ length: 8 }).map((_, index) => (
        <ChatHistoryItemSkeleton key={index} />
      ))}
    </div>
  </div>
);

export default ChatHistorySkeleton;
