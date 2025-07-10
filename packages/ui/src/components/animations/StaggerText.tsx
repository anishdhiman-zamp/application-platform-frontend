'use client';

import { type FC, useEffect, useRef, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'motion/react';

/*
 * StaggerText displays a sentence with staggered animation.
 * Basically it breaks down the words into letters and animates them one by one.
 *
 * Usage:
 * - A base gray text (visible).
 * - A shimmer overlay text with a blue gradient (initially hidden via `text-transparent`).
 * - The shimmer effect animates the gradient background from right to left.
 */

interface StaggeredTextProps {
  text: string;
  className?: string;
  delay?: number; // base delay (applied to all letters)
  showAnimation?: boolean;
}

export const StaggerText: FC<StaggeredTextProps> = ({ text, className = '', delay = 0, showAnimation = true }) => {
  const letters = text.split('');
  const totalDuration = delay + letters.length * 0.01;
  const staggerRatePerLetter = 0.005; // if want faster stagger, make 0.005 -> 0.0005
  const ref = useRef(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (!animationComplete) {
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, totalDuration * 1000);

      return () => clearTimeout(timer);
    }
  }, [animationComplete, totalDuration]);

  const variants = {
    hidden: { opacity: 0, y: 0 },
    show: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: showAnimation ? delay + i * staggerRatePerLetter : 0,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <motion.div
      ref={ref}
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
        />
      ))}
    </motion.div>
  );
};
