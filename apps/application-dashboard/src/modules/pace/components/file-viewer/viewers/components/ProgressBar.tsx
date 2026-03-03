'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  disabled?: boolean;
}

const ProgressBar = ({ currentTime, duration, onSeek, disabled = false }: ProgressBarProps) => {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState<number | null>(null);

  const displayTime = isDragging && dragTime !== null ? dragTime : currentTime;
  const progress = useMemo(() => (duration > 0 ? (displayTime / duration) * 100 : 0), [displayTime, duration]);

  const getTimeFromPosition = useCallback(
    (clientX: number) => {
      if (!progressBarRef.current) return 0;

      const rect = progressBarRef.current.getBoundingClientRect();
      const position = (clientX - rect.left) / rect.width;
      const clampedPosition = Math.max(0, Math.min(1, position));

      return clampedPosition * duration;
    },
    [duration],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;

    e.preventDefault();
    setIsDragging(true);
    const time = getTimeFromPosition(e.clientX);

    setDragTime(time);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      e.preventDefault();
      const time = getTimeFromPosition(e.clientX);

      setDragTime(time);
    },
    [isDragging, getTimeFromPosition],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragTime !== null) {
      onSeek(dragTime);
    }
    setIsDragging(false);
    setDragTime(null);
  }, [isDragging, dragTime, onSeek]);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled || isDragging) return;

    const time = getTimeFromPosition(e.clientX);

    onSeek(time);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className='group w-full flex-1'>
      <div
        ref={progressBarRef}
        className={cn('relative h-1 cursor-pointer rounded-xl bg-white', disabled && 'cursor-not-allowed opacity-50')}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <div
          className='absolute top-0 left-0 h-full rounded-xl bg-black transition-none'
          style={{ width: `${progress}%` }}
        />

        <div
          className={cn(
            'absolute top-1/2 h-[7px] w-[7px] -translate-y-1/2 transform rounded-full bg-black shadow-lg transition-opacity duration-200',
            isDragging || !disabled ? 'scale-110 opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
          style={{ left: `calc(${progress}% - 6px)` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
