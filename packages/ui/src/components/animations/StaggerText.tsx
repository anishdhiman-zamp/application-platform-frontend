'use client';

import { type FC } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'motion/react';

interface StaggeredTextPropsType {
  text: string;
  className?: string;
  delay?: number;
  showAnimation?: boolean;
  onStaggerAnimationComplete?: () => void;
}

export const StaggerText: FC<StaggeredTextPropsType> = ({
  text,
  className = '',
  delay = 0,
  showAnimation = true,
  onStaggerAnimationComplete,
}) => {
  const letters = text.split('');
  const staggerRatePerLetter = 0.005;

  const variants = {
    hidden: { opacity: 0, y: 0 },
    show: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: showAnimation ? delay + i * staggerRatePerLetter : 0,
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    }),
  };

  return (
    <motion.div
      initial='hidden'
      animate={showAnimation ? 'show' : 'hidden'}
      className={cn('text-GRAY_1000 inline-flex flex-wrap', className)}
      data-testid='stagger-text-container'
      data-state={showAnimation ? 'show' : 'hidden'}
    >
      {letters.map((letter, i) => (
        <motion.span
          key={`${letter}-${i}`}
          custom={i}
          variants={variants}
          className='inline-block'
          data-testid='stagger-letter'
          dangerouslySetInnerHTML={{ __html: letter === ' ' ? '&nbsp;' : letter }}
          onAnimationComplete={i === letters.length - 1 ? onStaggerAnimationComplete : undefined}
        />
      ))}
    </motion.div>
  );
};
