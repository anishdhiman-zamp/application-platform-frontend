'use client';

import { useScrollRef } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { formatChatTimestamp, formatChatTimestampTooltip, formatTimestampToUTC } from '@zamp-platform/utils';
import { motion } from 'motion/react';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { defaultFnType } from '@/types/commonTypes';

import { ButtonBlockType } from '../types/block.types';
import { ChatMessage, SenderType } from '../types/chat.types';
import { BlockRenderer } from './BlockRenderer';
import ChatFeedback from './ChatFeedback';
import CopyMessageButton from './CopyMessageButton';
import MessageTimestamp from './MessageTimestamp';

export interface MessageProps {
  message: ChatMessage;
  onAction?: (blockConfig: ButtonBlockType, payload: Record<string, string>) => void | Promise<void>;
  isLoading?: boolean;
  blockRendererClassName?: string;
  containerClassName?: string;
  conversationId?: string;
  messageId?: string;
  showTimestamp?: boolean;
  showFeedback?: boolean;
  showCopy?: boolean;
  feedbackDisabled?: boolean;
  isLastMessage?: boolean;
  /** Whether to play the entrance animation (controlled by parent to avoid re-triggering on remount) */
  shouldAnimate?: boolean;
  alignUserRight?: boolean;
  organizationId?: string;
  streamingEnabled?: boolean;
  assistantAvatar?: ReactNode;
}

export const Message: FC<MessageProps> = ({
  message,
  onAction,
  isLoading = false,
  blockRendererClassName = 'border-none shadow-none',
  containerClassName,
  conversationId,
  messageId,
  assistantAvatar,
  showTimestamp = false,
  showFeedback = false,
  showCopy = false,
  feedbackDisabled = false,
  isLastMessage = false,
  shouldAnimate = false,
  alignUserRight = false,
  organizationId,
  streamingEnabled = true,
}) => {
  const USER_MESSAGE_MAX_HEIGHT = 240;

  const scrollRef = useScrollRef();
  const cleanupRef = useRef<defaultFnType | null>(null);
  const [animationReady, setAnimationReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isUserMessage = message.sender_type === SenderType.USER;

  useEffect(() => {
    const el = contentRef.current;

    if (!el || !isUserMessage) return;

    const observer = new ResizeObserver(() => {
      setIsOverflowing(el.scrollHeight > USER_MESSAGE_MAX_HEIGHT);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [isUserMessage]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);
  const shouldAlignRight = alignUserRight && isUserMessage;
  const sharedClassName = cn('group space-y-3', shouldAlignRight && 'flex flex-col items-end', containerClassName);

  useEffect(() => {
    // Clean up any previous subscription
    cleanupRef.current?.();
    cleanupRef.current = null;

    if (!shouldAnimate) {
      setAnimationReady(false);
      return;
    }

    const el = scrollRef.current;

    if (!el) {
      // No scroll container context — start immediately
      setAnimationReady(true);
      return;
    }

    setAnimationReady(false);

    const handleScrollEnd = () => {
      setAnimationReady(true);
    };

    // Fallback: if chatScrollEnd never fires (e.g. very fast scroll or
    // browsers that don't support scrollend), start after 800 ms.
    const fallback = setTimeout(() => {
      el.removeEventListener('chatScrollEnd', handleScrollEnd);
      setAnimationReady(true);
    }, 800);

    el.addEventListener('chatScrollEnd', handleScrollEnd, { once: true });

    cleanupRef.current = () => {
      el.removeEventListener('chatScrollEnd', handleScrollEnd);
      clearTimeout(fallback);
    };

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [shouldAnimate, scrollRef]);

  const formattedTimestamp = useMemo(
    () => (message.timestamp ? formatChatTimestamp(formatTimestampToUTC(message.timestamp)) : ''),
    [message.timestamp],
  );

  const tooltipTimestamp = useMemo(
    () => (message.timestamp ? formatChatTimestampTooltip(formatTimestampToUTC(message.timestamp)) : ''),
    [message.timestamp],
  );

  const innerContent = (
    <>
      {message.sender_type === SenderType.ASSISTANT && assistantAvatar}

      <div
        className={cn('relative max-w-[620px]', shouldAlignRight && 'bg-GRAY_100 max-w-[80%] rounded-[10px] px-4 py-3')}
      >
        <div
          ref={contentRef}
          className={cn(isUserMessage && !isExpanded && 'overflow-hidden')}
          style={isUserMessage && !isExpanded ? { maxHeight: USER_MESSAGE_MAX_HEIGHT } : undefined}
        >
          <BlockRenderer
            message={{ block: message?.message_content?.elements ?? [] }}
            onAction={onAction}
            className={cn(blockRendererClassName)}
            conversationId={conversationId || message?.conversation_id}
            messageId={messageId || message?.id}
            isLoading={isLoading}
          />
        </div>
        {isUserMessage && isOverflowing && !isExpanded && (
          <div className='from-GRAY_100 pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-[10px] bg-linear-to-t from-10% to-transparent' />
        )}
        {isUserMessage && isOverflowing && (
          <div
            onClick={toggleExpanded}
            className='text-GRAY_900 hover:text-GRAY_1000 relative z-10 mt-2 flex cursor-pointer items-center gap-0.5 text-xs font-medium transition-colors'
          >
            {isExpanded ? 'See less ' : 'See more'}
          </div>
        )}
      </div>
      {streamingEnabled && (
        <div
          className={cn(
            'flex items-center',
            isLastMessage ? 'visible' : 'invisible group-hover:visible',
            shouldAlignRight && 'mt-0',
          )}
        >
          {showCopy && <CopyMessageButton messageContent={message.message_content} />}
          {showTimestamp && message.sender_type === SenderType.USER && (
            <MessageTimestamp formattedTimestamp={formattedTimestamp} tooltipTimestamp={tooltipTimestamp} />
          )}
          {showFeedback && message.sender_type === SenderType.ASSISTANT && (
            <ChatFeedback
              messageId={messageId || message?.id}
              conversationId={conversationId || message?.conversation_id}
              disabled={feedbackDisabled || isLoading}
              organizationId={organizationId}
            />
          )}
        </div>
      )}
    </>
  );

  if (isUserMessage) {
    return (
      <motion.div
        data-sender-type={message.sender_type}
        data-msg-expanded={isExpanded || undefined}
        className={sharedClassName}
        initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
        animate={!shouldAnimate || animationReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {innerContent}
      </motion.div>
    );
  }

  return (
    <div data-sender-type={message.sender_type} className={sharedClassName}>
      {innerContent}
    </div>
  );
};

export default Message;
