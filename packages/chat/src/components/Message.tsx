'use client';

import { useScrollRef } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { formatChatTimestamp, formatChatTimestampTooltip, formatTimestampToUTC } from '@zamp-platform/utils';
import { motion } from 'motion/react';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { defaultFnType } from '@/types/commonTypes';

import { BLOCK_TYPE, ButtonBlockType } from '../types/block.types';
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
  isLastMessage?: boolean;
  shouldAnimate?: boolean;
  organizationId?: string;
  assistantAvatar?: ReactNode;
  showMarkdownConnectors?: boolean;
  showConnectorToLastBlock?: boolean;
  showConnectorToNextBlock?: boolean;
  embeddedInStepSummary?: boolean;
  hideActions?: boolean;
}

export const USER_MESSAGE_MAX_HEIGHT = 240;

export const Message: FC<MessageProps> = ({
  message,
  onAction,
  isLoading = false,
  blockRendererClassName = 'border-none shadow-none',
  containerClassName,
  conversationId,
  messageId,
  assistantAvatar,
  isLastMessage = false,
  shouldAnimate = false,
  organizationId,
  showMarkdownConnectors = false,
  showConnectorToLastBlock = false,
  showConnectorToNextBlock = false,
  embeddedInStepSummary = false,
  hideActions = false,
}) => {
  const cleanupRef = useRef<defaultFnType | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useScrollRef();

  const [animationReady, setAnimationReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  const isUserMessage = message.sender_type === SenderType.USER;
  const isInputsRespondedBlock = message.message_content?.elements?.[0]?.type === BLOCK_TYPE.INPUTS_RESPONDED;
  const shouldAlignRight = isUserMessage;
  const sharedClassName = cn('group space-y-3', shouldAlignRight && 'flex flex-col items-end', containerClassName);

  const primaryBlockType = message?.message_content?.elements?.[0]?.type;
  const isUserInputsRespondedBubble = isUserMessage && primaryBlockType === BLOCK_TYPE.INPUTS_RESPONDED;

  const userBubbleLayoutClassName = useMemo(() => {
    if (!isUserMessage) return '';

    if (isUserInputsRespondedBubble) {
      return cn('relative min-w-0 w-full bg-transparent', shouldAlignRight ? 'max-w-[80%]' : 'max-w-[min(100%,700px)]');
    }

    return cn('relative min-w-0 w-auto', shouldAlignRight ? 'max-w-[80%]' : 'max-w-[min(100%,700px)]');
  }, [isUserMessage, isUserInputsRespondedBubble, shouldAlignRight]);

  const toggleExpanded = useCallback(() => {
    if (isExpanded) {
      // When collapsing, anchor the bottom of the message bubble so the scroll
      // position doesn't shift. We record the distance from the bottom of the
      // bubble to the bottom of the scroll container, then restore it after the
      // height change is applied.
      const scrollEl = scrollRef.current;
      const bubbleEl = contentRef.current?.closest<HTMLElement>('[data-sender-type]');

      if (scrollEl && bubbleEl) {
        const bubbleBottom = bubbleEl.getBoundingClientRect().bottom;
        const containerBottom = scrollEl.getBoundingClientRect().bottom;
        const distanceFromBottom = containerBottom - bubbleBottom;

        flushSync(() => {
          setIsExpanded(false);
        });

        // After React re-renders and the DOM shrinks, restore the scroll so the
        // bottom of the bubble stays at the same visual position.
        requestAnimationFrame(() => {
          const newBubbleBottom = bubbleEl.getBoundingClientRect().bottom;
          const delta = newBubbleBottom - (containerBottom - distanceFromBottom);
          scrollEl.scrollTop += delta;
        });
        return;
      }
    }

    setIsExpanded((prev) => !prev);
  }, [isExpanded, scrollRef]);
  const formattedTimestamp = useMemo(
    () => (message.timestamp ? formatChatTimestamp(formatTimestampToUTC(message.timestamp)) : ''),
    [message.timestamp],
  );

  const tooltipTimestamp = useMemo(
    () => (message.timestamp ? formatChatTimestampTooltip(formatTimestampToUTC(message.timestamp)) : ''),
    [message.timestamp],
  );

  const subscribeToScrollEnd = useCallback((el: HTMLElement) => {
    const handleScrollEnd = () => setAnimationReady(true);

    // Fallback: if chatScrollEnd never fires (e.g. very fast scroll or
    // browsers that don't support scrollend), start after 800 ms.
    const fallback = setTimeout(() => {
      el.removeEventListener('chatScrollEnd', handleScrollEnd);
      setAnimationReady(true);
    }, 800);

    el.addEventListener('chatScrollEnd', handleScrollEnd, { once: true });

    return () => {
      el.removeEventListener('chatScrollEnd', handleScrollEnd);
      clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    const el = contentRef.current;

    if (!el || !isUserMessage) return;

    const observer = new ResizeObserver(() => {
      setIsOverflowing(el.scrollHeight > USER_MESSAGE_MAX_HEIGHT);
    });

    observer.observe(el);

    return () => observer.disconnect();
  }, [isUserMessage]);

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
    cleanupRef.current = subscribeToScrollEnd(el);

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [shouldAnimate, scrollRef, subscribeToScrollEnd]);

  const innerContent = (
    <>
      {message.sender_type === SenderType.ASSISTANT && assistantAvatar}

      <div
        className={cn(
          message.sender_type === SenderType.ASSISTANT &&
            (embeddedInStepSummary
              ? 'relative w-full max-w-none min-w-0'
              : 'relative w-full max-w-[min(100%,700px)] min-w-0'),
          shouldAlignRight && !isUserInputsRespondedBubble && 'bg-GRAY_100 rounded-[10px] px-4 py-3',
          isUserMessage && userBubbleLayoutClassName,
        )}
      >
        <div
          ref={contentRef}
          className={cn(
            isUserMessage && !isExpanded && 'overflow-hidden',
            isUserMessage && 'flex w-fit max-w-full min-w-0 flex-col',
            isUserInputsRespondedBubble && 'w-full min-w-0',
          )}
          style={
            isUserMessage && !isExpanded && !isInputsRespondedBlock ? { maxHeight: USER_MESSAGE_MAX_HEIGHT } : undefined
          }
        >
          <BlockRenderer
            message={{ block: message?.message_content?.elements ?? [] }}
            onAction={onAction}
            className={cn('w-auto', blockRendererClassName, isUserInputsRespondedBubble && 'w-full')}
            conversationId={conversationId || message?.conversation_id}
            messageId={messageId || message?.id}
            isLoading={isLoading}
            showMarkdownConnectors={showMarkdownConnectors}
            showConnectorToLastBlock={showConnectorToLastBlock}
            showConnectorToNextBlock={showConnectorToNextBlock}
            embeddedInStepSummary={embeddedInStepSummary}
            compactParagraphs={isUserMessage}
          />
        </div>
        {isUserMessage && isOverflowing && !isExpanded && !isInputsRespondedBlock && (
          <div className='from-GRAY_100 pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-[10px] bg-linear-to-t from-20% to-transparent' />
        )}
        {isUserMessage && isOverflowing && !isInputsRespondedBlock && (
          <div
            onClick={toggleExpanded}
            className='text-GRAY_900 hover:text-GRAY_1000 relative z-10 mt-1 flex cursor-pointer items-center gap-0.5 text-xs font-medium transition-colors'
          >
            {isExpanded ? 'See less ' : 'See more'}
          </div>
        )}
      </div>
      <div
        className={cn(
          'flex items-center transition-opacity duration-200',
          hideActions
            ? 'opacity-0 group-hover:opacity-100'
            : isLastMessage && message.sender_type === SenderType.ASSISTANT
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100',
          shouldAlignRight && 'mt-0',
        )}
      >
        <CopyMessageButton messageContent={message.message_content} />
        {message.sender_type === SenderType.USER && (
          <MessageTimestamp formattedTimestamp={formattedTimestamp} tooltipTimestamp={tooltipTimestamp} />
        )}
        {message.sender_type === SenderType.ASSISTANT && (
          <ChatFeedback
            messageId={messageId || message?.id}
            conversationId={conversationId || message?.conversation_id}
            disabled={isLoading}
            organizationId={organizationId}
          />
        )}
      </div>
    </>
  );

  if (message.message_content?.elements?.length === 0) {
    return null;
  }

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
