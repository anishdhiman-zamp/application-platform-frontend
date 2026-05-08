'use client';

import { unreadStore } from '@zamp-platform/chat';
import { AnimatedDot, CSS_VARS } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import type { FeedbackItemType } from '@/types/api/feedbacks.types';

interface ChatHistoryItemProps {
  conversation: FeedbackItemType;
  onSelect: (id: string | null, title?: string) => void;
  isStreaming?: boolean;
  isTaskRunning?: boolean;
  isSelected?: boolean;
  isUnread?: boolean;
  needsInput?: boolean;
}

type DotState = 'needsInput' | 'streaming' | 'running' | 'unread' | 'read';

const resolveDotState = (
  needsInput: boolean | undefined,
  isStreaming: boolean | undefined,
  isTaskRunning: boolean | undefined,
  isUnread: boolean | undefined,
): DotState => {
  if (needsInput) return 'needsInput';
  if (isStreaming) return 'streaming';
  if (isTaskRunning) return 'running';
  if (isUnread) return 'unread';

  return 'read';
};

const DOT_COLOR: Record<DotState, string> = {
  needsInput: CSS_VARS.ORANGE_600,
  streaming: CSS_VARS.BLUE_700,
  running: CSS_VARS.BLUE_700,
  unread: CSS_VARS.GREEN_700,
  read: CSS_VARS.GRAY_500,
};

const DOT_TITLE: Record<DotState, string> = {
  needsInput: 'Needs your input',
  streaming: 'Generating response…',
  running: 'Task in progress…',
  unread: 'Mark as read',
  read: 'Mark as unread',
};

const ChatHistoryItem = ({
  conversation,
  onSelect,
  isStreaming,
  isTaskRunning,
  isSelected,
  isUnread,
  needsInput,
}: ChatHistoryItemProps) => {
  const conversationId = conversation?.id;
  const dotState = resolveDotState(needsInput, isStreaming, isTaskRunning, isUnread);
  const dotColor = DOT_COLOR[dotState];
  const dotTitle = DOT_TITLE[dotState];
  const isToggleable = dotState === 'unread' || dotState === 'read';
  const dot = (
    <AnimatedDot
      showAnimation={dotState === 'streaming' || dotState === 'running'}
      size={8}
      activeColor={dotColor}
      completeColor={dotColor}
      className='rounded-[2px]'
    />
  );

  const handleRowClick = () => {
    if (!conversationId) return;
    onSelect(conversationId, conversation?.title);
  };

  const handleDotClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (!conversationId || !isToggleable) return;
    if (isUnread) {
      unreadStore.markRead(conversationId);
    } else {
      unreadStore.markUnread(conversationId);
    }
  };

  return (
    <div
      className={cn(
        'group text-GRAY_700 hover:text-GRAY_900 hover:bg-accent flex h-8 cursor-pointer items-center rounded-lg border-[0.75px] border-transparent pr-3 text-sm font-medium transition-colors',
        isSelected &&
          'border-GRAY_500 text-GRAY_900 hover:text-GRAY_900 shadow-tab-shadow bg-BG_WHITE hover:bg-BG_WHITE',
      )}
      onClick={handleRowClick}
    >
      {isToggleable ? (
        <button
          type='button'
          onClick={handleDotClick}
          title={dotTitle}
          aria-label={dotTitle}
          className='flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg'
        >
          {dot}
        </button>
      ) : (
        <span className='flex size-8 shrink-0 items-center justify-center rounded-lg' title={dotTitle}>
          {dot}
        </span>
      )}
      <p className='min-w-0 flex-1 truncate text-left first-letter:uppercase'>
        {conversation?.title || 'Untitled conversation'}
      </p>
    </div>
  );
};

export default ChatHistoryItem;
