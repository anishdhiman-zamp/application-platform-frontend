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
import React, { FC, useCallback, useEffect, useRef } from 'react';
import { COLORS, CSS_VARS } from '../../constants/colors';

interface ShimmerTextProps {
  text: string;
  shimmerControlRef?: React.RefObject<(() => void) | null>; // for animation callback
  className?: string; // wrapper className
  shimmerTextClassName?: string;
  baseTextClassName?: string;
  baseColor?: string; // base text color
  shimmerColor?: string; // shimmer effect color
  autoAnimate?: boolean; // animate automatically or via ref
  animationDuration?: number; // animation duration (in ms)
}

export const ShimmerText: FC<ShimmerTextProps> = ({
  text,
  shimmerControlRef,
  className,
  shimmerTextClassName,
  baseTextClassName,
  baseColor = COLORS.GRAY_700,
  shimmerColor = CSS_VARS.BLUE_700,
  autoAnimate = true,
  animationDuration = 2000,
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);

  const startAnimation = useCallback(() => {
    if (!spanRef.current) return;

    // Stop any existing animation
    if (animationRef.current) {
      animationRef.current.cancel();
    }

    // Reset position
    spanRef.current.style.backgroundPosition = '120% 0%';

    // Start new animation
    animationRef.current = spanRef.current.animate(
      { backgroundPosition: ['120% 0%', '-20% 0%'] },
      { duration: animationDuration, easing: 'linear', fill: 'forwards' },
    );
  }, [animationDuration]);

  useEffect(() => {
    if (shimmerControlRef) {
      shimmerControlRef.current = startAnimation;

      return () => {
        shimmerControlRef.current = null;
      };
    } else if (autoAnimate) {
      let timeoutId: NodeJS.Timeout;

      const runAnimation = () => {
        startAnimation();
        // Schedule next animation to start after the current one completes
        timeoutId = setTimeout(runAnimation, animationDuration + 100); // Small delay between animations
      };

      runAnimation();

      return () => {
        clearTimeout(timeoutId);
        if (animationRef.current) {
          animationRef.current.cancel();
        }
      };
    }
  }, [shimmerControlRef, autoAnimate, animationDuration, startAnimation]);

  const shouldTruncate = baseTextClassName?.includes('truncate');

  return (
    <div className={cn('relative inline-block leading-none', shouldTruncate && 'overflow-hidden', className)}>
      {/* font-size and leading should be same, eg. f-13-450 and leading-[13px] */}
      <span
        className={cn('block text-[13px] leading-[1.667]! font-[450]', baseTextClassName)}
        style={{ color: baseColor }}
      >
        {text}
      </span>
      <span
        ref={spanRef}
        aria-hidden='true'
        className={cn(
          'pointer-events-none absolute top-0 left-0 bg-clip-text text-[13px] leading-[1.667]! font-[450] text-transparent',
          shouldTruncate && 'inset-0 block truncate',
          shimmerTextClassName,
        )}
        style={{
          backgroundImage: `linear-gradient(90deg, transparent 0%, transparent 40%, ${shimmerColor} 50%, transparent 60%, transparent 100%)`,
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
