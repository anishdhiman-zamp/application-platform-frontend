'use client';

import { motion, useAnimation } from 'motion/react';
import type { HTMLAttributes } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

import { cn } from '@zamp-platform/ui/utils';

export interface ShapesIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ShapesIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const ShapesIcon = forwardRef<ShapesIconHandle, ShapesIconProps>(
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
          style={{ overflow: 'visible' }}
          viewBox='0 0 24 24'
          width={size}
          xmlns='http://www.w3.org/2000/svg'
        >
          {/* Triangle - moves up */}
          <motion.path
            animate={controls}
            d='M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z'
            variants={{
              normal: { translateX: 0, translateY: 0 },
              animate: { translateX: 0, translateY: -1.5 },
            }}
          />
          {/* Rectangle - moves down-left */}
          <motion.rect
            animate={controls}
            x='3'
            y='14'
            width='7'
            height='7'
            rx='1'
            variants={{
              normal: { translateX: 0, translateY: 0 },
              animate: { translateX: -1.5, translateY: 1.5 },
            }}
          />
          {/* Circle - moves down-right */}
          <motion.circle
            animate={controls}
            cx='17.5'
            cy='17.5'
            r='3.5'
            variants={{
              normal: { translateX: 0, translateY: 0 },
              animate: { translateX: 1.5, translateY: 1.5 },
            }}
          />
        </svg>
      </div>
    );
  },
);

ShapesIcon.displayName = 'ShapesIcon';

export { ShapesIcon };
