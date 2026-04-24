import { Skeleton } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';

const TITLE_WIDTHS = ['w-4/5', 'w-3/5', 'w-11/12', 'w-2/3', 'w-3/4'];

const ChatHistoryItemSkeleton = ({ titleWidth }: { titleWidth: string }) => (
  <div className='flex h-auto w-full items-center rounded-lg px-3 py-2.5 pr-9'>
    <div className='flex min-w-0 flex-1 items-center gap-2'>
      <Skeleton className={cn('h-3.5 rounded', titleWidth)} />
      <Skeleton className='ml-auto h-3 w-8 shrink-0 rounded' />
    </div>
  </div>
);

interface ChatHistorySkeletonProps {
  itemCount?: number;
}

const ChatHistorySkeleton = ({ itemCount = 30 }: ChatHistorySkeletonProps) => (
  <div className='w-full space-y-0.5 px-2'>
    {Array.from({ length: itemCount }).map((_, index) => (
      <ChatHistoryItemSkeleton key={index} titleWidth={TITLE_WIDTHS[index % TITLE_WIDTHS.length]} />
    ))}
  </div>
);

export default ChatHistorySkeleton;
