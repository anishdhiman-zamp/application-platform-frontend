'use client';

import type { MouseEvent } from 'react';
import { useRef } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { motion, useAnimation, useReducedMotion } from 'motion/react';
import { getZampLogoEntryDirection } from '@/modules/chatbot/utils';
import ZampLogo, { ZAMP_LOGO_WRAPPER_VARIANTS } from '@/modules/chatbot/ZampLogo';

interface ZampIconProps {
  size?: number;
  className?: string;
  interactive?: boolean;
}

const SNAP_TRANSITION = { duration: 0 };

const ZampIcon = ({ size = 20, className, interactive = false }: ZampIconProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const controls = useAnimation();
  const prefersReducedMotion = useReducedMotion() ?? false;

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    if (!interactive || isAnimatingRef.current || prefersReducedMotion) return;
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const direction = getZampLogoEntryDirection(rect, event.clientX, event.clientY);

    isAnimatingRef.current = true;

    controls
      .start(direction)
      .then(() => controls.start('rest', SNAP_TRANSITION))
      .then(() => {
        isAnimatingRef.current = false;
      })
      .catch(() => {
        isAnimatingRef.current = false;
      });
  };

  return (
    <div
      ref={wrapperRef}
      className={cn('grid place-items-center', className)}
      style={{
        height: size,
        minHeight: size,
        width: size,
        minWidth: size,
        perspective: size * 8,
      }}
      onMouseEnter={interactive ? handleMouseEnter : undefined}
    >
      <motion.div
        variants={ZAMP_LOGO_WRAPPER_VARIANTS}
        animate={controls}
        initial='rest'
        className='grid place-items-center'
        style={{ transformStyle: 'preserve-3d' }}
      >
        <ZampLogo size={size} className='text-foreground' controls={controls} />
      </motion.div>
    </div>
  );
};

export default ZampIcon;
