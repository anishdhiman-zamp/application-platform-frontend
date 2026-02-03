'use client';

import type { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { AnimatePresence, easeInOut, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { DEFAULT_CHAT_TITLE } from '@/modules/pace/pace.constants';

interface ChatTopbarProps {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  onStartNewChat: () => void;
  onClose?: () => void;
}

const TITLE_ANIMATION_VARIANTS = {
  initial: { width: 0 },
  animate: { width: 'auto' },
  exit: { width: 0 },
};

const TITLE_TRANSITION = {
  duration: 0.8,
  ease: easeInOut,
};

const ChatTopbar: FC<ChatTopbarProps> = ({ className, style, title, onStartNewChat, onClose }) => {
  const displayTitle = title || DEFAULT_CHAT_TITLE;

  return (
    <div
      className={cn('border-GRAY_400 flex items-center justify-between gap-x-3 border-b p-3', className)}
      style={style}
    >
      <div className='f-13-500 relative min-w-0 flex-1 overflow-hidden first-letter:uppercase'>
        <AnimatePresence mode='wait'>
          <motion.span
            key={displayTitle}
            variants={TITLE_ANIMATION_VARIANTS}
            initial='initial'
            animate='animate'
            exit='exit'
            transition={TITLE_TRANSITION}
            className='block overflow-hidden whitespace-nowrap'
          >
            {displayTitle}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className='flex items-center gap-1.5'>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 rounded p-2 text-gray-900 hover:text-gray-900'
          onClick={onStartNewChat}
          title='Start new chat'
        >
          <Plus size={14} />
        </Button>
        {onClose && (
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 rounded p-2 text-gray-900 hover:text-gray-900'
            onClick={onClose}
            title='Close chat'
          >
            <Minus size={14} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatTopbar;
