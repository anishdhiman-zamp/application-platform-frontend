import { COLORS, ShimmerText } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import Image from 'next/image';
import { FC, ReactNode, useCallback, useEffect, useRef } from 'react';

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
  showTimestamp?: boolean;
  showFeedback?: boolean;
  feedbackDisabled?: boolean;
  showCopy?: boolean;
  alignUserRight?: boolean;
  hideSenderName?: boolean;
  userAvatarClassName?: string;
  userAvatarBackgroundColor?: string;
  children?: ReactNode;
  organizationId?: string;
  streamingEnabled?: boolean;
  conversationId?: string;
}

export const MessageContainer: FC<MessageContainerProps> = ({
  messages,
  handleAction,
  isAnalysing,
  streamingState,
  assistantName = 'Pace',
  assistantAvatar,
  className,
  showTimestamp = false,
  showFeedback = false,
  showCopy = false,
  feedbackDisabled = false,
  alignUserRight = false,
  hideSenderName = false,
  userAvatarClassName,
  userAvatarBackgroundColor = COLORS.ORANGE_400,
  children,
  organizationId,
  streamingEnabled = true,
  conversationId,
}) => {
  const defaultAssistantAvatar = assistantAvatar ?? <PaceAvatar />;
  const isInitialScrollRef = useRef(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  useEffect(() => {
    if (messages?.length > 0) {
      // Use instant scroll on first load, smooth scroll for subsequent updates
      const behavior = isInitialScrollRef.current ? 'instant' : 'smooth';
      scrollToBottom(behavior);
    }
  }, [messages?.length, scrollToBottom, children]);

  return (
    <div ref={scrollContainerRef} className={cn('flex w-full flex-grow flex-col gap-6 p-4', className)}>
      {messages?.map((message, index) => (
        <Message
          key={getMessageKey(message, index)}
          message={message}
          onAction={handleAction}
          assistantName={assistantName}
          assistantAvatar={defaultAssistantAvatar}
          showTimestamp={showTimestamp}
          alignUserRight={alignUserRight}
          conversationId={conversationId}
          hideSenderName={hideSenderName}
          userAvatar={(senderName) => (
            <Avatar
              name={senderName}
              backgroundColor={userAvatarBackgroundColor}
              className={cn(
                'f-12-500 text-gray-1000 flex h-6 min-h-6 w-6 min-w-6 items-center justify-center rounded-[7.5px] p-1',
                userAvatarClassName,
              )}
            />
          )}
          showFeedback={showFeedback}
          feedbackDisabled={feedbackDisabled}
          showCopy={showCopy}
          isLastMessage={index === messages.length - 1}
          organizationId={organizationId}
          streamingEnabled={streamingEnabled}
        />
      ))}

      {streamingState && !!streamingState.message_content?.elements?.length && (
        <StreamingMessage
          streamingState={streamingState}
          assistantName={assistantName}
          assistantAvatar={defaultAssistantAvatar}
          hideSenderName={hideSenderName}
        />
      )}

      {streamingState && !!streamingState.message_content?.elements?.length && (
        <div className='flex w-full items-center'>
          <div className='animate-pulse-scale'>
            <Image src='/icons/pace/pace-streaming.svg' alt='Pace Avatar' height={20} width={20} />
          </div>
        </div>
      )}

      {(isAnalysing && !streamingState) || (streamingState && !streamingState.message_content?.elements?.length) ? (
        <div className='flex w-full items-center gap-1.5 text-gray-700'>
          {defaultAssistantAvatar}
          <ShimmerText text='Analysing...' autoAnimate={true} />
        </div>
      ) : null}
      {children}
    </div>
  );
};

export default MessageContainer;
