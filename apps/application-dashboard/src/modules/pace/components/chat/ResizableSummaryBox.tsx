'use client';

import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';

const SUMMARY_MIN_H = 80;
const SUMMARY_MAX_H = 580;
const SUMMARY_DEFAULT_H = 580;

interface ResizableSummaryBoxProps {
  children: React.ReactNode;
  borderRadius: string;
  contentClassName?: string;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

const ResizableSummaryBox = ({ children, borderRadius, contentClassName, scrollRef }: ResizableSummaryBoxProps) => {
  const [maxH, setMaxH] = useState(SUMMARY_DEFAULT_H);
  const activeListenersRef = useRef<{ onMove: (e: PointerEvent) => void; onUp: () => void } | null>(null);

  useEffect(() => {
    return () => {
      if (activeListenersRef.current) {
        window.removeEventListener('pointermove', activeListenersRef.current.onMove);
        window.removeEventListener('pointerup', activeListenersRef.current.onUp);
        activeListenersRef.current = null;
      }
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const startY = e.clientY;
      const startH = maxH;

      const onMove = (ev: PointerEvent) => {
        const delta = ev.clientY - startY;

        setMaxH(Math.min(SUMMARY_MAX_H, Math.max(SUMMARY_MIN_H, startH + delta)));
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        activeListenersRef.current = null;
      };

      activeListenersRef.current = { onMove, onUp };
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [maxH],
  );

  return (
    <div
      className={cn('border-GRAY_400 bg-BG_WHITE flex flex-col overflow-hidden border', borderRadius)}
      style={{ maxHeight: maxH }}
    >
      <div ref={scrollRef} className={cn('flex-1 overflow-y-auto [scrollbar-width:thin]', contentClassName)}>
        {children}
      </div>
      <div
        className='flex shrink-0 cursor-row-resize items-center justify-center py-1'
        onPointerDown={handlePointerDown}
      >
        <div className='bg-GRAY_300 h-[3px] w-[26px] rounded-[10px]' />
      </div>
    </div>
  );
};

export default ResizableSummaryBox;
