'use client';

/*
 * ShimmerText displays a text label with an animated shimmer effect
 * Basically a color flows from left to right over the text).
 *
 * Usage:
 * - A base gray text (visible).
 * - A shimmer overlay text with a blue gradient (initially hidden via `text-transparent`).
 * - The shimmer effect animates the gradient background from right to left.
 *
 * When `leadingIcon` is provided, the icon and text share a single shimmer pass
 * via a moving `mask-image` overlay so the animation reads as one continuous wave.
 */

import { cn } from '@zamp-platform/ui/utils';
import React, { FC, useCallback, useEffect, useRef } from 'react';
import { COLORS, CSS_VARS } from '../../constants/colors';

interface ShimmerTextProps {
  text: string;
  leadingIcon?: React.ReactNode; // optional icon node — shimmer passes across both icon + text as one wave
  shimmerControlRef?: React.RefObject<(() => void) | null>; // for animation callback
  className?: string; // wrapper className
  shimmerTextClassName?: string;
  baseTextClassName?: string;
  baseColor?: string; // base text color
  shimmerColor?: string; // shimmer effect color
  autoAnimate?: boolean; // animate automatically or via ref
  animationDuration?: number; // animation duration (in ms)
}

const MASK_GRADIENT =
  'linear-gradient(90deg, transparent 0%, transparent 40%, black 50%, transparent 60%, transparent 100%)';

export const ShimmerText: FC<ShimmerTextProps> = ({
  text,
  leadingIcon,
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const hasIcon = leadingIcon != null;

  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.cancel();
    }

    if (hasIcon) {
      const target = overlayRef.current;

      if (!target) return;

      target.style.setProperty('-webkit-mask-position', '120% 0%');
      target.style.setProperty('mask-position', '120% 0%');
      animationRef.current = target.animate(
        {
          WebkitMaskPosition: ['120% 0%', '-20% 0%'],
          maskPosition: ['120% 0%', '-20% 0%'],
        },
        { duration: animationDuration, easing: 'linear', fill: 'forwards' },
      );

      return;
    }

    const target = spanRef.current;

    if (!target) return;

    target.style.backgroundPosition = '120% 0%';
    animationRef.current = target.animate(
      { backgroundPosition: ['120% 0%', '-20% 0%'] },
      { duration: animationDuration, easing: 'linear', fill: 'forwards' },
    );
  }, [animationDuration, hasIcon]);

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
  const sharedTextClasses = cn('block text-[13px] leading-[1.667] font-[420]', baseTextClassName);

  if (hasIcon) {
    return (
      <div
        className={cn('relative inline-flex items-center leading-none', shouldTruncate && 'overflow-hidden', className)}
      >
        <div className='inline-flex items-center gap-x-2' style={{ color: baseColor }}>
          {leadingIcon}
          <span className={sharedTextClasses}>{text}</span>
        </div>
        <div
          ref={overlayRef}
          aria-hidden='true'
          className={cn('pointer-events-none absolute inset-0 inline-flex items-center gap-x-2', shimmerTextClassName)}
          style={{
            color: shimmerColor,
            WebkitMaskImage: MASK_GRADIENT,
            maskImage: MASK_GRADIENT,
            WebkitMaskSize: '200% 100%',
            maskSize: '200% 100%',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: '120% 0%',
            maskPosition: '120% 0%',
          }}
        >
          {leadingIcon}
          <span className={sharedTextClasses}>{text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative inline-block leading-none', shouldTruncate && 'overflow-hidden', className)}>
      <span className={sharedTextClasses} style={{ color: baseColor }}>
        {text}
      </span>
      <span
        ref={spanRef}
        aria-hidden='true'
        className={cn(
          sharedTextClasses,
          'pointer-events-none absolute inset-0 bg-clip-text text-transparent',
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
