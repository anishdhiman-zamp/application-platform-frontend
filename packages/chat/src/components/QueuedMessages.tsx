'use client';

import { cn } from '@zamp-platform/ui/utils';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FC, useState } from 'react';

import { ChatMessage } from '../types/chat.types';

interface QueuedMessagesProps {
  messages: ChatMessage[];
  className?: string;
}

export const QueuedMessages: FC<QueuedMessagesProps> = ({ messages, className }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (messages.length === 0) return null;

  return (
    <div
      className={cn(
        'bg-GRAY_50 border-GRAY_400 flex w-full flex-col items-start gap-1.5 rounded-t-xl border px-2.5 pt-2 pb-6',
        className,
      )}
    >
      <button
        type='button'
        onClick={() => setIsExpanded((prev) => !prev)}
        className='flex items-center gap-2 text-left'
      >
        <ChevronDown
          className={cn('text-GRAY_700 size-3.5 shrink-0 transition-transform', !isExpanded && '-rotate-90')}
        />
        <span className='text-GRAY_700 text-[13px] leading-normal font-[450]'>
          Queued, sending soon... ({messages.length})
        </span>
      </button>

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
            {messages.map((msg) => (
              <div key={msg.timestamp} className='flex w-full items-start gap-2 py-1'>
                <p className='text-GRAY_1000 line-clamp-2 min-w-0 flex-1 text-sm leading-normal font-[450]'>
                  {getMessagePreview(msg)}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getMessagePreview(msg: ChatMessage): string {
  return msg.message_content?.text || msg.message_content?.message || '';
}

export default QueuedMessages;
