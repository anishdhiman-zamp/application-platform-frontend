'use client';

import { Paperclip } from 'lucide-react';

import type { ChatMessage } from '../types/chat.types';
import { getMessagePreview, getQueuedRefs } from '../utils/message.utils';
import { buildMentionMatcher, wrapMentions } from './blocks/utils/markdownBlock.utils';

interface QueuedMessageItemProps {
  message: ChatMessage;
}

export const QueuedMessageItem = ({ message }: QueuedMessageItemProps) => {
  const text = getMessagePreview(message);
  const { mentions, uploadCount } = getQueuedRefs(message);
  const mentionMatcher = buildMentionMatcher(mentions);
  const renderedText = text ? wrapMentions(text, mentionMatcher, `q-${message.id}`) : null;

  return (
    <div className='flex w-full items-center gap-2 py-1'>
      {renderedText && <p className='text-GRAY_900 f-13-450 line-clamp-2 min-w-0 flex-1 leading-5'>{renderedText}</p>}
      {uploadCount > 0 && (
        <span className='text-GRAY_700 f-12-450 inline-flex shrink-0 items-center gap-1'>
          <Paperclip className='size-3.5' />
          {uploadCount}
        </span>
      )}
    </div>
  );
};

export default QueuedMessageItem;
