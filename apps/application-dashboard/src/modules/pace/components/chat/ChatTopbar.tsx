'use client';

import type { FC } from 'react';
import { Button } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, Minimize2, Plus, X } from 'lucide-react';
import { DEFAULT_CHAT_TITLE } from '@/modules/pace/pace.constants';

interface ChatTopbarProps {
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  onStartNewChat: () => void;
  onClose?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const TITLE_ANIMATION_VARIANTS = {
  initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -8, filter: 'blur(4px)' },
};

const TITLE_TRANSITION = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1] as const,
};

const ChatTopbar: FC<ChatTopbarProps> = ({
  className,
  style,
  title,
  onStartNewChat,
  onClose,
  isExpanded,
  onToggleExpand,
}) => {
  const displayTitle = title || DEFAULT_CHAT_TITLE;

  return (
    <div
      className={cn('border-GRAY_400 flex h-10 items-center justify-between gap-x-2 border-b p-3', className)}
      style={style}
    >
      <div className='f-11-550 relative min-w-0 flex-1 overflow-hidden first-letter:uppercase'>
        <AnimatePresence mode='wait'>
          <motion.span
            key={displayTitle}
            variants={TITLE_ANIMATION_VARIANTS}
            initial={false}
            animate='animate'
            exit='exit'
            transition={TITLE_TRANSITION}
            className='block truncate'
          >
            {displayTitle}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className='flex items-center gap-1'>
        <Button
          variant='ghost'
          size='icon'
          className='h-6 w-6 p-2 text-gray-600 hover:text-gray-900'
          onClick={onStartNewChat}
          title='Start new chat'
        >
          <Plus size={12} />
        </Button>
        {onToggleExpand && (
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 p-2 text-gray-600 hover:text-gray-900'
            onClick={onToggleExpand}
            title={isExpanded ? 'Minimize chat' : 'Expand chat'}
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </Button>
        )}
        {onClose && (
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6 p-2 text-gray-600 hover:text-gray-900'
            onClick={onClose}
            title='Close chat'
          >
            <X size={12} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatTopbar;
