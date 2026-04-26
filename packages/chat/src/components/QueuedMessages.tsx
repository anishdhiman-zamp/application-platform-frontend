'use client';

import { ScrollContainer, type ScrollContainerRef } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { ChatMessage } from '../types/chat.types';
import { QueuedMessageItem } from './QueuedMessageItem';

const COLLAPSE_ANIMATION = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.2, ease: 'easeOut' },
} as const;

interface QueuedMessagesProps {
  messages: ChatMessage[];
  className?: string;
}

export const QueuedMessages = ({ messages, className }: QueuedMessagesProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<ScrollContainerRef | null>(null);
  const hasMessages = Boolean(messages?.length);
  const messageCount = messages?.length ?? 0;

  useEffect(() => {
    scrollRef.current?.scrollToBottom('instant');
  }, [messageCount]);

  return (
    <AnimatePresence initial={false}>
      {hasMessages && (
        <motion.div key='queued-container' {...COLLAPSE_ANIMATION} className='w-full overflow-hidden'>
          <div
            className={cn(
              'bg-BG_GRAY_2 border-GRAY_400 flex w-full flex-col items-start gap-1 rounded-t-xl border px-3 pt-2 pb-5',
              className,
            )}
          >
            <div
              role='button'
              tabIndex={0}
              onClick={() => setIsExpanded((prev) => !prev)}
              className='flex cursor-pointer items-center gap-2 text-left'
            >
              <ChevronDown
                className={cn('text-GRAY_700 size-3.5 shrink-0 transition-transform', !isExpanded && '-rotate-90')}
              />
              <span className='text-GRAY_700 f-13-450'>Queued, sending soon... ({messages?.length})</span>
            </div>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div key='queued-list' {...COLLAPSE_ANIMATION} className='flex w-full flex-col overflow-hidden'>
                  <ScrollContainer
                    ref={scrollRef}
                    className='max-h-[240px] w-full'
                    scrollClassName='gap-1'
                    scrollbarStyle='none'
                    fadeColor='var(--BG_GRAY_2)'
                    fadeHeight='h-4'
                  >
                    {messages?.map((msg) => (
                      <QueuedMessageItem key={msg.id} message={msg} />
                    ))}
                  </ScrollContainer>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QueuedMessages;
