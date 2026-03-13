import { FC } from 'react';
import { Skeleton } from '@zamp-platform/ui';
import { cn } from '@/utils/common';

const UserMessageSkeleton = ({ alignUserRight }: { alignUserRight?: boolean }) => (
  <div className={cn('flex flex-col gap-1.5', alignUserRight ? 'items-end' : 'items-start')}>
    <Skeleton className='h-4 w-48 rounded' />
  </div>
);

const AssistantMessageSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className='flex flex-col gap-1.5'>
    <div className='flex items-center gap-2'>
      <Skeleton className='h-5 w-5 rounded-full' />
    </div>
    <div className='space-y-2'>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className='h-4 rounded' style={{ width: `${Math.max(40, 100 - index * 20)}%` }} />
      ))}
    </div>
  </div>
);

interface ChatMessagesSkeletonProps {
  count?: number;
  className?: string;
  alignUserRight?: boolean;
}

const ChatMessagesSkeleton: FC<ChatMessagesSkeletonProps> = ({ count = 1, className, alignUserRight = false }) => {
  return (
    <div className={cn('flex w-full flex-col px-3 py-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={`chat-message-skeleton-${index}`} className='flex w-full flex-col gap-6'>
          <UserMessageSkeleton alignUserRight={alignUserRight} />
          <AssistantMessageSkeleton lines={4} />
          <UserMessageSkeleton alignUserRight={alignUserRight} />
          <AssistantMessageSkeleton lines={2} />
        </div>
      ))}
    </div>
  );
};

export default ChatMessagesSkeleton;
