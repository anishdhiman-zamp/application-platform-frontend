'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';

const STEP_DURATION_MS = 120;
const SETTLE_DELAY_MS = 30;

interface BarrelCounterProps {
  value: number;
  className?: string;
}

const BarrelCounter = ({ value, className }: BarrelCounterProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [nextValue, setNextValue] = useState<number | null>(null);
  const [sliding, setSliding] = useState(false);
  const prevValueRef = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentRef = useRef(value);
  const targetRef = useRef(value);
  const directionRef = useRef(1);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stepAnimate = useCallback(() => {
    if (currentRef.current === targetRef.current) {
      setSliding(false);
      setNextValue(null);

      return;
    }

    const upcoming = currentRef.current + directionRef.current;

    setNextValue(upcoming);

    requestAnimationFrame(() => {
      setSliding(true);
    });

    timerRef.current = setTimeout(() => {
      currentRef.current = upcoming;
      setSliding(false);
      setDisplayValue(upcoming);
      setNextValue(null);

      timerRef.current = setTimeout(stepAnimate, SETTLE_DELAY_MS);
    }, STEP_DURATION_MS);
  }, []);

  useEffect(() => {
    if (prevValueRef.current === value) return;

    currentRef.current = prevValueRef.current;
    targetRef.current = value;
    directionRef.current = value > prevValueRef.current ? 1 : -1;
    prevValueRef.current = value;

    stepAnimate();

    return clearTimer;
  }, [value, stepAnimate, clearTimer]);

  const hasNext = nextValue !== null;

  return (
    <span className={cn('relative inline-block overflow-hidden align-baseline', className)}>
      <span className='invisible'>{displayValue}</span>

      <span
        className='absolute inset-x-0 top-0 flex flex-col'
        style={{
          transition: sliding ? `transform ${STEP_DURATION_MS}ms cubic-bezier(0.33, 0, 0.2, 1)` : 'none',
          transform: sliding ? 'translateY(-50%)' : 'translateY(0)',
        }}
      >
        <span className='flex items-center justify-center whitespace-nowrap'>{displayValue}</span>
        {hasNext && <span className='flex items-center justify-center whitespace-nowrap'>{nextValue}</span>}
      </span>
    </span>
  );
};

export default BarrelCounter;
