'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { AGENT_GREETING_MESSAGE } from '@/modules/pace/components/agents/constants/agents.constants';
import { useTypingAnimation } from '@/modules/pace/components/agents/hooks/useTypingAnimation';

const EASE_CURVE = [0.25, 0.1, 0.25, 1] as const;

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
        initial={{ opacity: 0, maxWidth: 34, paddingLeft: 8, paddingRight: 8 }}
        animate={{
          opacity: main.isVisible ? 1 : 0,
          maxWidth: main.isVisible && showText ? 500 : 34,
          paddingLeft: main.isVisible && showText ? 12 : 8,
          paddingRight: main.isVisible && showText ? 12 : 8,
        }}
        transition={{
          opacity: { duration: 0.4, ease: 'easeInOut' },
          maxWidth: { duration: 0.7, ease: EASE_CURVE, delay: expanding ? 0.15 : 0 },
          paddingLeft: { duration: 0.7, ease: EASE_CURVE, delay: expanding ? 0.15 : 0 },
          paddingRight: { duration: 0.7, ease: EASE_CURVE, delay: expanding ? 0.15 : 0 },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.span
          className='inline-block overflow-hidden'
          animate={{ opacity: main.isVisible && showText ? 1 : 0, width: main.isVisible && showText ? 'auto' : 0 }}
          transition={{
            width: { duration: 0.5, ease: EASE_CURVE },
            opacity: { duration: 0.4, ease: 'easeInOut', delay: expanding ? 0.2 : 0 },
          }}
        >
          {main.displayedText || '\u00A0'}
        </motion.span>
        <motion.span
          className='text-GRAY_700 f-12-500 flex items-center justify-center overflow-hidden'
          animate={{ opacity: main.isVisible && showText ? 0 : 1 }}
          transition={{ opacity: { duration: 0.2, ease: 'easeInOut', delay: main.isVisible && showText ? 0 : 0.4 } }}
        >
          @
        </motion.span>
      </motion.div>

      <motion.div
        className='border-GRAY_400 hover:bg-BG_GRAY_2 f-12-500 flex cursor-pointer items-center overflow-hidden rounded-full border py-2 whitespace-nowrap transition-colors'
        onClick={onAddTrigger}
        initial={{ opacity: 0 }}
        animate={{
          opacity: main.isComplete ? 1 : 0,
          maxWidth: isTriggerHovered ? 300 : 34,
          paddingLeft: isTriggerHovered ? 12 : 8,
          paddingRight: isTriggerHovered ? 12 : 8,
        }}
        transition={{
          opacity: { duration: 0.4, ease: 'easeInOut', delay: main.isComplete ? 0.3 : 0 },
          maxWidth: { duration: 0.7, ease: EASE_CURVE },
          paddingLeft: { duration: 0.7, ease: EASE_CURVE },
          paddingRight: { duration: 0.7, ease: EASE_CURVE },
        }}
        onMouseEnter={() => setIsTriggerHovered(true)}
        onMouseLeave={() => setIsTriggerHovered(false)}
      >
        <motion.span
          className='inline-block overflow-hidden'
          animate={{ opacity: isTriggerHovered ? 1 : 0, width: isTriggerHovered ? 'auto' : 0 }}
          transition={{
            width: { duration: 0.5, ease: EASE_CURVE },
            opacity: { duration: 0.4, ease: 'easeInOut', delay: isTriggerHovered ? 0.2 : 0 },
          }}
        >
          Add a trigger
        </motion.span>
        <motion.span
          className='text-GRAY_700 flex items-center justify-center overflow-hidden'
          animate={{ opacity: isTriggerHovered ? 0 : 1 }}
          transition={{ opacity: { duration: 0.2, ease: 'easeInOut', delay: isTriggerHovered ? 0 : 0.4 } }}
        >
          <Zap size={14} />
        </motion.span>
      </motion.div>
    </div>
  );
};

export default AgentGreeting;
