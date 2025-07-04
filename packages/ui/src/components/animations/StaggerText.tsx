'use client';

import { type FC, useEffect, useRef, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { motion } from 'motion/react';

type StaggeredTextPropsType = {
  text: string;
  className?: string;
  delay?: number; // base delay (applied to all letters)
  show?: boolean;
  showAnimation?: boolean;
};

export const StaggerText: FC<StaggeredTextPropsType> = ({
  text,
  className = '',
  delay = 0,
  show = true,
  showAnimation = true,
}) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const ref = useRef(null);
  const letters = text.split('');

  const totalDuration = delay + letters.length * 0.01;

  useEffect(() => {
    if (show && !animationComplete) {
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, totalDuration * 1000);

      return () => clearTimeout(timer);
    }
  }, [show, animationComplete, totalDuration]);

  const variants = {
    hidden: { opacity: 0, y: 0 },
    show: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        // if want faster stagger, make 0.005 -> 0.0005
        delay: showAnimation ? delay + i * 0.005 : 0,
        duration: 0.3,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <motion.div
      ref={ref}
      initial='hidden'
      animate={show ? 'show' : 'hidden'}
      className={cn('text-GRAY_1000 inline-flex flex-wrap', className)}
    >
      {letters.map((letter, i) => (
        <motion.span key={`${letter}-${i}`} custom={i} variants={variants} className='inline-block'>
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};
