'use client';

import type { Variants } from 'motion/react';
import { motion, useAnimation } from 'motion/react';
import type { HTMLAttributes, MouseEvent } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

import { cn } from '@zamp-platform/ui/utils';

export interface LayoutGridIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface LayoutGridIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const RECT_VARIANTS: Variants = {
  normal: {
    scale: 1,
    transition: { duration: 0.2 },
  },
  animate: {
    scale: [1, 0.8, 1],
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

const LayoutGridIcon = forwardRef<LayoutGridIconHandle, LayoutGridIconProps>(
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
      (e: MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start('animate');
        }
      },
      [controls, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e: MouseEvent<HTMLDivElement>) => {
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
          <motion.rect
            animate={controls}
            height='7'
            initial='normal'
            rx='1'
            variants={RECT_VARIANTS}
            width='7'
            x='3'
            y='3'
          />
          <motion.rect
            animate={controls}
            height='7'
            initial='normal'
            rx='1'
            variants={RECT_VARIANTS}
            width='7'
            x='14'
            y='3'
          />
          <motion.rect
            animate={controls}
            height='7'
            initial='normal'
            rx='1'
            variants={RECT_VARIANTS}
            width='7'
            x='3'
            y='14'
          />
          <motion.rect
            animate={controls}
            height='7'
            initial='normal'
            rx='1'
            variants={RECT_VARIANTS}
            width='7'
            x='14'
            y='14'
          />
        </svg>
      </div>
    );
  },
);

LayoutGridIcon.displayName = 'LayoutGridIcon';

export { LayoutGridIcon };
