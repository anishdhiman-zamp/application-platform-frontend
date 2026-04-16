'use client';

import { cn } from '@zamp-platform/ui/utils';
import { formatPlural } from '@zamp-platform/utils';
import { ChevronDown, Paperclip } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { ChatMessage } from '../types/chat.types';
import { getAttachmentCount, getMessagePreview } from '../utils/message.utils';

interface QueuedMessagesProps {
  messages: ChatMessage[];
  className?: string;
}

export const QueuedMessages = ({ messages, className }: QueuedMessagesProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const hasMessages = Boolean(messages?.length);
  const messageCount = messages?.length ?? 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messageCount]);

  return (
    <AnimatePresence initial={false}>
      {hasMessages && (
        <motion.div
          key='queued-container'
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className='w-full overflow-hidden'
        >
          <div
            className={cn(
              'bg-BG_GRAY_2 border-GRAY_400 flex w-full flex-col items-start gap-1.5 rounded-t-xl border px-2.5 pt-2 pb-5',
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
                <motion.div
                  key='queued-list'
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className='flex w-full flex-col overflow-hidden'
                >
                  <div ref={scrollRef} className='flex max-h-[240px] w-full flex-col overflow-y-auto'>
                    {messages?.map((msg) => {
                      const text = getMessagePreview(msg);
                      const attachmentCount = getAttachmentCount(msg);

                      return (
                        <div
                          key={msg.id}
                          className='hover:bg-GRAY_100 flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1'
                        >
                          <p className='text-GRAY_1000 f-14-450 line-clamp-2 min-w-0 flex-1'>
                            {text || formatPlural(attachmentCount, 'attachment')}
                          </p>
                          {text && attachmentCount > 0 && (
                            <span className='text-GRAY_600 flex shrink-0 items-center gap-0.5 text-xs'>
                              <Paperclip className='size-3' />
                              {attachmentCount}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
