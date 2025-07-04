'use client';

import { cn } from '@zamp-platform/ui/utils';
import { FC, useEffect, useRef } from 'react';

type ShimmerEffectPropsType = {
  text: string;
  shimmerControlRef?: React.RefObject<(() => void) | null>; // for animation callback
  shimmerTextClassName?: string;
  baseTextClassName?: string;
};

export const ShimmerText: FC<ShimmerEffectPropsType> = ({
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
