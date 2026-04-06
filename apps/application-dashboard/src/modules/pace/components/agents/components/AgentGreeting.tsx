'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { AGENT_GREETING_MESSAGE } from '@/modules/pace/components/agents/constants/agents.constants';
import { useTypingAnimation } from '@/modules/pace/components/agents/hooks/useTypingAnimation';

interface AgentGreetingProps {
  onChat: () => void;
  isAvatarHovered?: boolean;
}

const AgentGreeting = ({ onChat, isAvatarHovered = false }: AgentGreetingProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className='-mt-4 flex flex-1 flex-col justify-end'>
      <motion.div
        className='border-GRAY_400 f-12-500 flex w-fit cursor-pointer items-center overflow-hidden rounded-[20px] rounded-bl-none border py-2 whitespace-nowrap'
        onClick={onChat}
        animate={{
          opacity: main.isVisible ? 1 : 0,
          maxWidth: showText ? 500 : 34,
          paddingLeft: showText ? 12 : 8,
          paddingRight: showText ? 12 : 8,
        }}
        transition={{
          opacity: { duration: 0.3 },
          maxWidth: { duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: expanding ? 0.2 : 0 },
          paddingLeft: { duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: expanding ? 0.2 : 0 },
          paddingRight: { duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: expanding ? 0.2 : 0 },
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.span
          className='inline-block overflow-hidden'
          animate={{ opacity: showText ? 1 : 0, width: showText ? 'auto' : 0 }}
          transition={{
            width: { duration: 0.3, ease: 'easeInOut' },
            opacity: { duration: 0.3, ease: 'easeInOut', delay: expanding ? 0.25 : 0 },
          }}
        >
          {main.displayedText || '\u00A0'}
        </motion.span>
        <motion.span
          className='flex items-center justify-center overflow-hidden'
          animate={{ opacity: showText ? 0 : 1 }}
          transition={{
            opacity: { duration: 0.1, ease: 'easeInOut', delay: showText ? 0 : 0.5 },
          }}
        >
          <Plus size={14} className='text-GRAY_1000 shrink-0' />
        </motion.span>
      </motion.div>
    </div>
  );
};

export default AgentGreeting;
