import { ShimmerText } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import Image from 'next/image';
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

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
  assistantAvatar?: ReactNode;
  className?: string;
  showTimestamp?: boolean;
  showFeedback?: boolean;
  feedbackDisabled?: boolean;
  showCopy?: boolean;
  alignUserRight?: boolean;
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
  assistantAvatar,
  className,
  showTimestamp = false,
  showFeedback = false,
  showCopy = false,
  feedbackDisabled = false,
  alignUserRight = false,
  children,
  organizationId,
  streamingEnabled = true,
  conversationId,
}) => {
  const defaultAssistantAvatar = assistantAvatar ?? <PaceAvatar />;
  const isInitialScrollRef = useRef(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [animatedLength, setAnimatedLength] = useState(messages?.length ?? 0);
  const lastMessage = messages?.[messages.length - 1];
  const isNewUserMessage = lastMessage?.sender_type === 'USER' && messages.length > animatedLength;

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

  useEffect(() => {
    if (isNewUserMessage) {
      const timer = setTimeout(() => setAnimatedLength(messages.length), 600);

      return () => clearTimeout(timer);
    }
  }, [isNewUserMessage, messages.length]);

  return (
    <div ref={scrollContainerRef} className={cn('flex w-full grow flex-col gap-6 p-4', className)}>
      {messages?.map((message, index) => (
        <Message
          key={getMessageKey(message, index)}
          message={message}
          onAction={handleAction}
          assistantAvatar={defaultAssistantAvatar}
          showTimestamp={showTimestamp}
          alignUserRight={alignUserRight}
          conversationId={conversationId}
          showFeedback={showFeedback}
          feedbackDisabled={feedbackDisabled}
          showCopy={showCopy}
          isLastMessage={index === messages.length - 1}
          shouldAnimate={index === messages.length - 1 && isNewUserMessage}
          organizationId={organizationId}
          streamingEnabled={streamingEnabled}
        />
      ))}

      {streamingState && !!streamingState.message_content?.elements?.length && (
        <StreamingMessage streamingState={streamingState} assistantAvatar={defaultAssistantAvatar} />
      )}

      {streamingState && !!streamingState.message_content?.elements?.length && (
        <div className='flex w-full items-center'>
          <div className='animate-scale dark:brightness-0 dark:invert'>
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
