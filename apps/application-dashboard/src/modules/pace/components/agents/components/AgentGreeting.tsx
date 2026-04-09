'use client';

import { useEffect, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { AGENT_GREETING_MESSAGE } from '@/modules/pace/components/agents/constants/agents.constants';
import { useTypingAnimation } from '@/modules/pace/components/agents/hooks/useTypingAnimation';

interface AgentGreetingProps {
  onChat: () => void;
  onAddTrigger: () => void;
  isAvatarHovered?: boolean;
}

const AgentGreeting = ({ onChat, onAddTrigger, isAvatarHovered = false }: AgentGreetingProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isTriggerHovered, setIsTriggerHovered] = useState(false);

  const showText = !isCollapsed || isHovered || isAvatarHovered;
  const expanding = showText && isCollapsed;

  const main = useTypingAnimation({
    text: AGENT_GREETING_MESSAGE,
    durationMs: 500,
    delayMs: 1000,
    enabled: true,
  });

  useEffect(() => {
    if (!main.isComplete) return;

    const timer = setTimeout(() => setIsCollapsed(true), 3000);

    return () => clearTimeout(timer);
  }, [main.isComplete]);

  return (
    <div className='-mt-4 flex flex-1 items-end justify-start gap-1.5'>
      <motion.div
        className='border-GRAY_400 hover:bg-BG_GRAY_2 f-12-500 flex w-fit cursor-pointer items-center overflow-hidden rounded-[20px] rounded-bl-none border py-2 whitespace-nowrap transition-colors'
        onClick={onChat}
        initial={{ opacity: 0, maxWidth: 20, paddingLeft: 10, paddingRight: 10 }}
        animate={{
          opacity: main.isVisible ? 1 : 0,
          maxWidth: main.isVisible && showText ? 500 : isCollapsed ? 34 : 20,
          paddingLeft: main.isVisible && showText ? 12 : 10,
          paddingRight: main.isVisible && showText ? 12 : 10,
        }}
        transition={{
          opacity: { duration: 0.4, ease: 'easeOut' },
          maxWidth: { duration: 0.7, ease: 'easeOut', delay: expanding ? 0.1 : 0 },
          paddingLeft: { duration: 0.7, ease: 'easeOut', delay: expanding ? 0.1 : 0 },
          paddingRight: { duration: 0.7, ease: 'easeOut', delay: expanding ? 0.1 : 0 },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.span
          className={cn('inline-block overflow-hidden', isCollapsed && 'text-GRAY_700')}
          animate={{
            opacity: main.isVisible ? 1 : 0,
            width: main.isVisible && showText ? 'auto' : isCollapsed ? 15 : 0,
          }}
          transition={{
            width: { duration: 0.7, ease: 'easeOut', delay: expanding ? 0.1 : 0 },
            opacity: { duration: 0.4, ease: 'easeInOut' },
          }}
        >
          {main.displayedText || '\u00A0'}
        </motion.span>
      </motion.div>

      <motion.div
        className={cn(
          'border-GRAY_400 hover:bg-BG_GRAY_2 f-12-500 flex w-fit cursor-pointer items-center overflow-hidden rounded-full border py-2 whitespace-nowrap transition-colors',
          isCollapsed && 'text-GRAY_700',
        )}
        onClick={onAddTrigger}
        initial={{ opacity: 0, maxWidth: 20, paddingLeft: 10, paddingRight: 10 }}
        animate={{
          opacity: main.isComplete ? 1 : 0,
          maxWidth: isTriggerHovered ? 300 : 34,
          paddingLeft: isTriggerHovered ? 12 : 10,
          paddingRight: isTriggerHovered ? 12 : 10,
        }}
        transition={{
          opacity: { duration: 0.4, ease: 'easeOut', delay: main.isComplete ? 0.3 : 0 },
          maxWidth: { duration: 0.7, ease: 'easeOut' },
          paddingLeft: { duration: 0.7, ease: 'easeOut' },
          paddingRight: { duration: 0.7, ease: 'easeOut' },
        }}
        onMouseEnter={() => setIsTriggerHovered(true)}
        onMouseLeave={() => setIsTriggerHovered(false)}
      >
        <Zap size={14} className='shrink-0' />
        <motion.span
          className='inline-block overflow-hidden'
          animate={{ opacity: main.isComplete ? 1 : 0, width: isTriggerHovered ? 'auto' : 0 }}
          transition={{
            width: { duration: 0.7, ease: 'easeOut' },
            opacity: { duration: 0.4, ease: 'easeInOut' },
          }}
        >
          <span className='ml-1.5'>Add a trigger</span>
        </motion.span>
      </motion.div>
    </div>
  );
};

export default AgentGreeting;
