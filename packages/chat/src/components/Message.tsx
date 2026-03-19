'use client';

import { useScrollRef } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { formatChatTimestamp, formatChatTimestampTooltip, formatTimestampToUTC } from '@zamp-platform/utils';
import { motion } from 'motion/react';
import React, { FC, ReactNode, useEffect, useMemo, useRef, useState } from 'react';

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
  const isUserMessage = message.sender_type === SenderType.USER;
  const shouldAlignRight = alignUserRight && isUserMessage;
  const sharedClassName = cn('group space-y-3', shouldAlignRight && 'flex flex-col items-end', containerClassName);

  const scrollRef = useScrollRef();
  const [animationReady, setAnimationReady] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

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

      <BlockRenderer
        message={{ block: message?.message_content?.elements ?? [] }}
        onAction={onAction}
        className={cn(
          'max-w-[620px]',
          shouldAlignRight && 'bg-GRAY_100 max-w-[80%] rounded-[10px] px-4 py-3',
          blockRendererClassName,
        )}
        conversationId={conversationId || message?.conversation_id}
        messageId={messageId || message?.id}
        isLoading={isLoading}
      />
      {streamingEnabled && (
        <motion.div
          initial={isLastMessage ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
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
        </motion.div>
      )}
    </>
  );

  // User messages always use motion.div so the element type never changes —
  // switching between motion.div and div remounts the subtree, causing the
  // copy/timestamp bar to blink (e.g. when isLastMessage changes as the AI
  // response starts streaming in).
  // animationReady gates the animation so it only starts after the anchor
  // scroll finishes (via the chatScrollEnd event from ScrollContainer).
  if (isUserMessage) {
    return (
      <motion.div
        data-sender-type={message.sender_type}
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
