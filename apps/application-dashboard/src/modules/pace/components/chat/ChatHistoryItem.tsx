'use client';

import { useMemo } from 'react';
import { AnimatedDot } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { formatTimestampToUTC } from '@zamp-platform/utils/date';
import { Loader2 } from 'lucide-react';
import { formatRelativeTime } from '@/modules/pace/components/files/file-tree.utils';
import type { FeedbackItemType } from '@/types/api/feedbacks.types';

interface ChatHistoryItemProps {
  conversation: FeedbackItemType;
  onSelect: (id: string | null, title?: string) => void;
  isStreaming?: boolean;
  isSelected?: boolean;
  isUnread?: boolean;
}

const ChatHistoryItem = ({ conversation, onSelect, isStreaming, isSelected, isUnread }: ChatHistoryItemProps) => {
  const renderStatusIcon = () => {
    if (isStreaming) return <Loader2 className='text-BLUE_700 h-3 w-3 shrink-0 animate-spin' />;
    if (isUnread) return <AnimatedDot showAnimation className='shrink-0' size={7} />;

    return null;
  };

  const relativeTime = useMemo(() => {
    const timestamp = conversation?.updated_at || conversation?.created_at;

    if (!timestamp) return null;

    return formatRelativeTime(new Date(formatTimestampToUTC(timestamp)).getTime());
  }, [conversation?.updated_at, conversation?.created_at]);

  const handleClick = () => {
    onSelect(conversation?.id, conversation?.title);
  };

  const statusIcon = renderStatusIcon();
  const hasStatusIcon = Boolean(statusIcon);

  return (
    <div
      className={cn(
        'group text-GRAY_700 hover:text-GRAY_900 hover:bg-accent relative flex h-8 cursor-pointer items-center gap-x-2 rounded-lg border-[0.75px] border-transparent px-2 text-sm font-medium transition-colors',
        isSelected &&
          'border-GRAY_500 text-GRAY_900 hover:text-GRAY_900 shadow-tab-shadow bg-BG_WHITE hover:bg-BG_WHITE',
      )}
      onClick={handleClick}
    >
      <p className='min-w-0 flex-1 truncate text-left first-letter:uppercase'>
        {conversation?.title || 'Untitled conversation'}
      </p>

      {relativeTime && (
        <span className='f-12-400 text-GRAY_600 shrink-0 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100'>
          {relativeTime}
        </span>
      )}

      {hasStatusIcon && (
        <span className='absolute right-1.5 flex h-5 w-5 items-center justify-center transition-opacity group-hover:opacity-0'>
          {statusIcon}
        </span>
      )}
    </div>
  );
};

export default ChatHistoryItem;
