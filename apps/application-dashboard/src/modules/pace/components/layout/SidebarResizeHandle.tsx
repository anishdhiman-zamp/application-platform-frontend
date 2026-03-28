'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { FILES_PANEL_WIDTH, SIDEBAR_MAX_WIDTH, SIDEBAR_MIN_WIDTH } from 'modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

const HANDLE_WIDTH = 8;
const PADDING = 16;
const MIN_MAIN_WIDTH = 100;

const SidebarResizeHandle = () => {
  const { sidebarWidth, setSidebarWidth, setIsSidebarResizing, filesPanelOpen, filesPanelPinned } = usePaceContext();

  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef<number>(0);
  const dragStartWidthRef = useRef<number>(sidebarWidth);
  const effectiveMaxWidthRef = useRef<number>(SIDEBAR_MAX_WIDTH);
  const handleRef = useRef<HTMLDivElement>(null);

  const computeEffectiveMax = useCallback(() => {
    const isPinned = filesPanelOpen && filesPanelPinned;
    const filesPanelSpace = isPinned ? FILES_PANEL_WIDTH + 8 : 0;

    const parentWidth = handleRef.current?.parentElement?.clientWidth ?? window.innerWidth - PADDING;
    const available = parentWidth - HANDLE_WIDTH - MIN_MAIN_WIDTH - filesPanelSpace;

    return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, available));
  }, [filesPanelOpen, filesPanelPinned]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragStartXRef.current = e.clientX;
      dragStartWidthRef.current = sidebarWidth;
      effectiveMaxWidthRef.current = computeEffectiveMax();

      setIsDragging(true);
      setIsSidebarResizing(true);
    },
    [sidebarWidth, setIsSidebarResizing, computeEffectiveMax],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const delta = e.clientX - dragStartXRef.current;
      const newWidth = Math.min(
        effectiveMaxWidthRef.current,
        Math.max(SIDEBAR_MIN_WIDTH, dragStartWidthRef.current + delta),
      );

      setSidebarWidth(newWidth);
    },
    [setSidebarWidth],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsSidebarResizing(false);
  }, [setIsSidebarResizing]);

  useEffect(() => {
    if (!isDragging) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={handleRef}
      onMouseDown={handleMouseDown}
      className='group relative flex h-full w-2 shrink-0 cursor-col-resize items-center justify-center select-none'
    >
      <div
        className={cn(
          'h-12 w-0.5 rounded-full transition-all duration-150',
          isDragging ? 'bg-GRAY_500 h-16' : 'group-hover:bg-GRAY_400 bg-transparent',
        )}
      />
    </div>
  );
};

export default SidebarResizeHandle;
