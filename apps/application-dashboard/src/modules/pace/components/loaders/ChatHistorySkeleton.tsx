import { Skeleton } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';

const TITLE_WIDTHS = ['w-4/5', 'w-3/5', 'w-11/12', 'w-2/3', 'w-3/4'];

const ChatHistoryItemSkeleton = ({ titleWidth }: { titleWidth: string }) => (
  <div className='flex h-8 w-full items-center gap-x-2 rounded-lg px-2'>
    <Skeleton className={cn('h-3.5 rounded', titleWidth)} />
    <Skeleton className='ml-auto h-3 w-8 shrink-0 rounded' />
  </div>
);

interface ChatHistorySkeletonProps {
  itemCount?: number;
}

const ChatHistorySkeleton = ({ itemCount = 30 }: ChatHistorySkeletonProps) => (
  <div className='flex w-full flex-col gap-y-0.5 px-3'>
    {Array.from({ length: itemCount }).map((_, index) => (
      <ChatHistoryItemSkeleton key={index} titleWidth={TITLE_WIDTHS[index % TITLE_WIDTHS.length]} />
    ))}
  </div>
);

export default ChatHistorySkeleton;
