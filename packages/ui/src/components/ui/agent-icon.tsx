'use client';

import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import React from 'react';

import { cn } from '@zamp-platform/ui/utils';

export interface AgentIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface AgentIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    pathOffset: 0,
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    pathOffset: [1, 0],
    transition: {
      duration: 0.6,
      ease: 'linear',
      opacity: { duration: 0.1 },
    },
  },
};

const AgentIcon = forwardRef<AgentIconHandle, AgentIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start('animate'),
        stopAnimation: () => controls.start('normal'),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start('animate');
        }
      },
      [controls, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start('normal');
        }
      },
      [controls, onMouseLeave],
    );

    return (
      <div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
        <svg
          fill='none'
          height={size}
          stroke='currentColor'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          viewBox='0 0 24 24'
          width={size}
          xmlns='http://www.w3.org/2000/svg'
        >
          <motion.path
            animate={controls}
            d='M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z'
            initial='normal'
            variants={VARIANTS}
          />
          <motion.path animate={controls} d='M14 3v4a2 2 0 0 0 2 2h4' initial='normal' variants={VARIANTS} />
          <motion.path animate={controls} d='M8 13h0' initial='normal' variants={VARIANTS} />
          <motion.path animate={controls} d='M16 13h0' initial='normal' variants={VARIANTS} />
          <motion.path animate={controls} d='M10 16s.8 1 2 1c1.3 0 2-1 2-1' initial='normal' variants={VARIANTS} />
        </svg>
      </div>
    );
  },
);

AgentIcon.displayName = 'AgentIcon';

export { AgentIcon };
