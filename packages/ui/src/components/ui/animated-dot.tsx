'use client';

import { cn } from '@zamp-platform/ui/utils';
import type { Variants } from 'motion/react';
import { motion } from 'motion/react';
import { FC } from 'react';

import { CSS_VARS } from '../../constants/colors';

const DOT_VARIANTS: Variants = {
  idle: {
    scale: 1,
    opacity: 1,
  },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.6, 1],
    transition: {
      duration: 1,
      repeat: Number.POSITIVE_INFINITY,
      ease: 'easeInOut',
    },
  },
};

interface AnimatedDotProps {
  showAnimation: boolean;
  size?: number;
  className?: string;
  activeColor?: string;
  completeColor?: string;
}

export const AnimatedDot: FC<AnimatedDotProps> = ({
  showAnimation,
  size = 8,
  className,
  activeColor = CSS_VARS.BLUE_700,
  completeColor = CSS_VARS.GRAY_700,
}) => {
  return (
    <motion.div
      variants={DOT_VARIANTS}
      initial='idle'
      animate={showAnimation ? 'animate' : 'idle'}
      className={cn('rounded-full', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: showAnimation ? activeColor : completeColor,
      }}
    />
  );
};
