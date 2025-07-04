'use client';

/*
 * ShimmerText displays a text label with an animated shimmer effect
 * Basically a color flows from left to right over the text).
 *
 * Usage:
 * - A base gray text (visible).
 * - A shimmer overlay text with a blue gradient (initially hidden via `text-transparent`).
 * - The shimmer effect animates the gradient background from right to left.
 */

import { cn } from '@zamp-platform/ui/utils';
import { FC, useEffect, useRef } from 'react';

interface ShimmerEffectProps {
  text: string;
  shimmerControlRef?: React.RefObject<(() => void) | null>; // for animation callback
  shimmerTextClassName?: string;
  baseTextClassName?: string;
}

export const ShimmerText: FC<ShimmerEffectProps> = ({
  text,
  shimmerControlRef,
  shimmerTextClassName,
  baseTextClassName,
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!spanRef.current || !shimmerControlRef) return;

    shimmerControlRef.current = () => {
      spanRef.current!.animate(
        { backgroundPosition: ['120% 0%', '-20% 0%'] },
        { duration: 2000, easing: 'linear', fill: 'forwards' },
      );
    };

    return () => {
      shimmerControlRef.current = null;
    };
  }, [shimmerControlRef]);

  return (
    <div className='relative inline-block leading-none'>
      <span className={cn('f-13-450 block leading-[13px] text-[#C0C0C0]', baseTextClassName)}>{text}</span>
      <span
        ref={spanRef}
        aria-hidden='true'
        className={cn(
          'f-13-450 pointer-events-none absolute top-0 left-0 bg-clip-text leading-[13px] text-transparent',
          shimmerTextClassName,
        )}
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent 0%, transparent 40%, #1E64FF 50%, transparent 60%, transparent 100%)',
          backgroundSize: '200% 100%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '120% 0%',
        }}
      >
        {text}
      </span>
    </div>
  );
};
