'use client';

import { cn } from '@zamp-platform/ui/utils';
import { formatPlural } from '@zamp-platform/utils';
import { ChevronDown, Paperclip } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { FC, useState } from 'react';

import { ChatMessage } from '../types/chat.types';

interface QueuedMessagesProps {
  messages: ChatMessage[];
  className?: string;
}

export const QueuedMessages: FC<QueuedMessagesProps> = ({ messages, className }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!messages?.length) return null;

  return (
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
            {messages?.map((msg) => {
              const text = getMessagePreview(msg);
              const attachmentCount = getAttachmentCount(msg);

              return (
                <div
                  key={msg.id}
                  className='hover:bg-GRAY_100 flex w-full items-center gap-1.5 rounded-[8px] px-2 py-1'
                >
                  <p className='text-GRAY_1000 f-14-450 line-clamp-1 min-w-0 flex-1'>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getMessagePreview(msg: ChatMessage): string {
  return msg.message_content?.text || msg.message_content?.message || '';
}

function getAttachmentCount(msg: ChatMessage): number {
  return (msg.message_content?.file_references?.length ?? 0) + (msg.message_content?.attachments?.length ?? 0);
}

export default QueuedMessages;
