'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TooltipV2 } from '@zamp-platform/ui';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { AGENT_GREETING_MESSAGE } from '@/modules/pace/components/agents/constants/agents.constants';
import { useTypingAnimation } from '@/modules/pace/components/agents/hooks/useTypingAnimation';

interface AgentGreetingProps {
  onChat: () => void;
  onAddTrigger: () => void;
  hasSeenGreeting?: boolean;
  onGreetingSeen?: () => void;
}

const AgentGreeting = ({ onChat, onAddTrigger, hasSeenGreeting = false, onGreetingSeen }: AgentGreetingProps) => {
  // Capture the initial value at mount so the animation path stays stable through the session.
  // The parent only needs to know after-the-fact that the greeting has been seen; the current
  // render keeps playing its natural typing -> expand -> collapse sequence.
  const skipAnimationRef = useRef(hasSeenGreeting);
  const skipAnimation = skipAnimationRef.current;

  const [isCollapsed, setIsCollapsed] = useState(skipAnimation);
  const [collapseTweenDone, setCollapseTweenDone] = useState(skipAnimation);

  const showText = !isCollapsed;
  const showIconContent = skipAnimation || collapseTweenDone;

  const main = useTypingAnimation({
    text: AGENT_GREETING_MESSAGE,
    durationMs: 500,
    delayMs: 1000,
    enabled: !skipAnimation,
  });

  const handleGreetingComplete = useCallback(() => {
    setIsCollapsed(true);
    onGreetingSeen?.();
  }, [onGreetingSeen]);

  useEffect(() => {
    if (skipAnimation || !main.isComplete) return;

    const timer = setTimeout(handleGreetingComplete, 3000);

    return () => clearTimeout(timer);
  }, [skipAnimation, main.isComplete, handleGreetingComplete]);

  const firstPill = (
    <motion.div
      className='border-GRAY_400 hover:bg-BG_GRAY_2 f-12-500 flex w-fit cursor-pointer items-center overflow-hidden rounded-[20px] rounded-bl-none border px-2.5 py-2 whitespace-nowrap transition-colors'
      onClick={onChat}
      onAnimationComplete={() => {
        if (isCollapsed) setCollapseTweenDone(true);
      }}
      initial={{ maxWidth: 34 }}
      animate={{ maxWidth: !skipAnimation && main.isVisible && showText ? 500 : 34 }}
      transition={{ maxWidth: { duration: 0.7, ease: 'easeOut' } }}
    >
      <motion.span
        className={cn('inline-block overflow-hidden', (isCollapsed || skipAnimation) && 'text-GRAY_700')}
        initial={{ opacity: skipAnimation ? 1 : 0.7 }}
        animate={{ opacity: skipAnimation || main.isVisible || isCollapsed ? 1 : 0.7 }}
        transition={{ opacity: { duration: 0.4, ease: 'easeInOut' } }}
      >
        {showIconContent || !main.displayedText ? '@' : main.displayedText}
      </motion.span>
    </motion.div>
  );

  return (
    <div className='-mt-4 flex flex-1 items-end justify-start gap-1.5'>
      <TooltipV2
        tooltipBody={AGENT_GREETING_MESSAGE.replace(/^@\s*/, '')}
        side='top'
        asChildTrigger
        disabled={!(isCollapsed || skipAnimation)}
      >
        {firstPill}
      </TooltipV2>

      <TooltipV2 tooltipBody='Add a trigger' side='top' asChildTrigger>
        <div
          className='border-GRAY_400 hover:bg-BG_GRAY_2 text-GRAY_700 flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors'
          onClick={onAddTrigger}
        >
          <Zap size={14} />
        </div>
      </TooltipV2>
    </div>
  );
};

export default AgentGreeting;
