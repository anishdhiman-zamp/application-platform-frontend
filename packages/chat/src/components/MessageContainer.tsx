import { ArrowDownIcon, Button, COLORS, ShimmerText } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import NewPaceIcons from '@/assets/Icons/NewPaceIcons';
import Avatar from '@/components/common/avatar';
import PaceAvatar from '@/modules/chatbot/PaceAvatar';

import { ButtonBlockType } from '../types/block.types';
import { ChatMessage, StreamingState } from '../types/chat.types';
import Message from './Message';
import { StreamingMessage } from './StreamingMessage';

/**
 * Generates a unique key for a message, ensuring no duplicates
 * Uses message.id if available, otherwise falls back to timestamp with index
 */
const getMessageKey = (message: ChatMessage, index: number): string => {
  if (message.id) {
    return message.id;
  }
  return `${message.timestamp || 'msg'}-${index}`;
};

interface MessageContainerProps {
  messages: ChatMessage[];
  handleAction?: (blockConfig: ButtonBlockType, payload: Record<string, string>) => void | Promise<void>;
  isAnalysing: boolean;
  streamingState?: StreamingState | null;
  assistantName?: string;
  assistantAvatar?: ReactNode;
  className?: string;
  onScrollChange?: (isScrolled: boolean) => void;
  streamingEnabled?: boolean;
}

export const MessageContainer: FC<MessageContainerProps> = ({
  messages,
  handleAction,
  isAnalysing,
  streamingState,
  assistantName = 'Pace',
  assistantAvatar,
  className,
  onScrollChange,
  streamingEnabled = false,
}) => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const isInitialScrollRef = useRef(true);
  const defaultAssistantAvatar = assistantAvatar ?? <PaceAvatar />;

  const checkIfScrolledToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      return distanceFromBottom < 100;
    }
    return true;
  }, []);

  const checkIfContentOverflows = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      return scrollHeight > clientHeight;
    }
    return false;
  }, []);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const isScrolled = messagesContainerRef.current.scrollTop > 0;
      onScrollChange?.(isScrolled);

      const isAtBottom = checkIfScrolledToBottom();

      // Don't show button during initial scroll on page load
      if (isInitialScrollRef.current) {
        if (isAtBottom) {
          // Initial scroll completed, now we can track scroll position
          isInitialScrollRef.current = false;
        }
        return;
      }

      setShowScrollButton(!isAtBottom);
    }
  }, [onScrollChange, checkIfScrolledToBottom]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  const handleScrollToBottomClick = useCallback(() => {
    scrollToBottom('smooth');
  }, [scrollToBottom]);

  useEffect(() => {
    if (messages?.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages?.length, scrollToBottom]);

  // Check for content overflow on mount and when content changes
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has been updated
    const checkOverflow = () => {
      if (messagesContainerRef.current && !isInitialScrollRef.current) {
        const hasOverflow = checkIfContentOverflows();
        const isAtBottom = checkIfScrolledToBottom();
        setShowScrollButton(hasOverflow && !isAtBottom);
      }
    };

    // Check after a short delay to allow for DOM updates
    const timeoutId = setTimeout(checkOverflow, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, streamingState, checkIfContentOverflows, checkIfScrolledToBottom]);

  return (
    <div
      className={cn('flex w-full flex-grow flex-col gap-6 overflow-y-auto p-4', className)}
      ref={messagesContainerRef}
      onScroll={handleScroll}
    >
      {messages?.map((message, index) => (
        <Message
          key={getMessageKey(message, index)}
          message={message}
          onAction={handleAction}
          assistantName={assistantName}
          assistantAvatar={defaultAssistantAvatar}
          userAvatar={(senderName) => (
            <Avatar
              name={senderName}
              backgroundColor={COLORS.YELLOW_300}
              className='f-10-500 text-gray-1000 flex h-4 min-h-4 w-4 min-w-4 items-center justify-center rounded-md'
            />
          )}
        />
      ))}

      {streamingState && !!streamingState.message_content?.elements?.length && (
        <StreamingMessage
          streamingState={streamingState}
          assistantName={assistantName}
          assistantAvatar={defaultAssistantAvatar}
        />
      )}

      {streamingState && !!streamingState.message_content?.elements?.length && (
        <div className='flex w-full items-center'>
          <div className='animate-opacity animate-spin'>
            <NewPaceIcons height={24} width={24} />
          </div>
        </div>
      )}

      {(isAnalysing && !streamingState) || (streamingState && !streamingState.message_content?.elements?.length) ? (
        <div className='flex w-full items-center gap-1.5 text-gray-700'>
          {defaultAssistantAvatar}
          <ShimmerText text='Analysing...' autoAnimate={true} />
        </div>
      ) : null}

      {/* Scroll to bottom button */}
      {streamingEnabled && (
        <Button
          onClick={handleScrollToBottomClick}
          variant={'ghost'}
          className={cn(
            'bg-GRAY_1000 hover:bg-GRAY_1000 sticky bottom-1 left-1/2 h-6 w-6 -translate-x-1/2 self-center !rounded-full p-3',
            'transition-all duration-200 ease-out',
            showScrollButton ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
          )}
          aria-label='Scroll to bottom'
        >
          <ArrowDownIcon size={14} className='p-[2px] text-white' />
        </Button>
      )}
    </div>
  );
};

export default MessageContainer;
