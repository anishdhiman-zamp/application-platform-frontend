import { ShimmerText, useScrollRef } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'motion/react';
import Image from 'next/image';
import { FC, ReactNode, useEffect, useRef, useState } from 'react';

import PaceAvatar from '@/modules/chatbot/PaceAvatar';

import { ButtonBlockType } from '../types/block.types';
import { ChatMessage, SenderType, StreamingState } from '../types/chat.types';
import { getMessageKey } from '../utils/message.utils';
import Message from './Message';
import { StreamingMessage } from './StreamingMessage';

interface MessageContainerProps {
  messages: ChatMessage[];
  handleAction?: (blockConfig: ButtonBlockType, payload: Record<string, string>) => void | Promise<void>;
  isAnalysing: boolean;
  streamingState?: StreamingState | null;
  assistantAvatar?: ReactNode;
  className?: string;
  children?: ReactNode;
  organizationId?: string;
  conversationId?: string;
  showMarkdownConnectors?: boolean;
  showStreamingAvatar?: boolean;
}

export const MessageContainer: FC<MessageContainerProps> = ({
  messages,
  handleAction,
  isAnalysing,
  streamingState,
  assistantAvatar,
  className,
  children,
  organizationId,
  conversationId,
  showMarkdownConnectors = false,
  // showStreamingAvatar = true,
}) => {
  const previousConversationIdRef = useRef(conversationId);
  const [animatedLength, setAnimatedLength] = useState(() => {
    const len = messages?.length ?? 0;
    return isAnalysing && !conversationId ? Math.max(0, len - 1) : len;
  });
  const defaultAssistantAvatar = assistantAvatar ?? <PaceAvatar />;
  const lastMessage = messages?.[messages.length - 1];
  const isNewUserMessage = lastMessage?.sender_type === SenderType.USER && messages.length > animatedLength;
  const [showAnalysing, setShowAnalysing] = useState(false);
  const scrollRef = useScrollRef();
  const isNewUserMessageRef = useRef(isNewUserMessage);
  isNewUserMessageRef.current = isNewUserMessage;

  useEffect(() => {
    const prevId = previousConversationIdRef.current;
    previousConversationIdRef.current = conversationId;

    if (prevId && prevId !== conversationId) {
      setAnimatedLength(messages?.length ?? 0);
    }
  }, [conversationId, messages?.length]);

  useEffect(() => {
    if (isNewUserMessage) {
      const timer = setTimeout(() => setAnimatedLength(messages.length), 600);

      return () => clearTimeout(timer);
    }
  }, [isNewUserMessage, messages.length]);

  useEffect(() => {
    if (!isAnalysing) {
      setShowAnalysing(false);
      return;
    }

    if (!isNewUserMessageRef.current) {
      setShowAnalysing(true);
      return;
    }

    // Wait for the scroll to finish (chatScrollEnd event from ScrollContainer),
    // then wait for the 300ms message entrance animation before showing Analysing.
    const el = scrollRef.current;

    let showAnalysingTimer: ReturnType<typeof setTimeout> | null = null;

    const show = () => {
      showAnalysingTimer = setTimeout(() => setShowAnalysing(true), 300);
    };

    if (el) {
      el.addEventListener('chatScrollEnd', show, { once: true });
    } else {
      show();
    }

    // Fallback — if chatScrollEnd never fires, show after 1200ms
    const fallback = setTimeout(() => {
      if (el) el.removeEventListener('chatScrollEnd', show);
      setShowAnalysing(true);
    }, 1200);

    return () => {
      if (el) el.removeEventListener('chatScrollEnd', show);
      if (showAnalysingTimer) clearTimeout(showAnalysingTimer);
      clearTimeout(fallback);
    };
  }, [isAnalysing, scrollRef]);

  return (
    <div className={cn('flex w-full grow flex-col gap-6 p-4', className)}>
      {messages?.map((message, index) => {
        const isLast = index === messages.length - 1;
        const isStreamingOverlap =
          isLast && !!streamingState?.message_content?.elements?.length && message.sender_type === SenderType.ASSISTANT;

        return (
          <Message
            key={getMessageKey(message, index)}
            message={message}
            onAction={handleAction}
            assistantAvatar={defaultAssistantAvatar}
            conversationId={conversationId}
            isLastMessage={isLast}
            shouldAnimate={isLast && isNewUserMessage}
            organizationId={organizationId}
            showMarkdownConnectors={showMarkdownConnectors}
            hideActions={isStreamingOverlap}
          />
        );
      })}

      {streamingState && !!streamingState.message_content?.elements?.length && (
        <StreamingMessage
          streamingState={streamingState}
          assistantAvatar={defaultAssistantAvatar}
          showMarkdownConnectors={showMarkdownConnectors}
        />
      )}

      {streamingState && !!streamingState.message_content?.elements?.length && (
        <div className='flex w-full items-center'>
          <Image
            src='/loaders/zamp-logo-cropped-loader.svg'
            alt='Zamp Logo'
            height={20}
            width={20}
            className='dark:opacity-50'
          />
        </div>
      )}

      {showAnalysing &&
      ((isAnalysing && !streamingState) || (streamingState && !streamingState.message_content?.elements?.length)) ? (
        <motion.div
          initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={{ opacity: 1, clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] }}
          className='flex w-full items-center gap-1.5 text-gray-700'
        >
          {defaultAssistantAvatar}
          <ShimmerText text='Analysing...' autoAnimate={true} />
        </motion.div>
      ) : null}
      {children}
    </div>
  );
};

export default MessageContainer;
