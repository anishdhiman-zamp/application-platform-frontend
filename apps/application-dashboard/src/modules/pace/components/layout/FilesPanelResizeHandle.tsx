'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { FILES_PANEL_MAX_WIDTH, FILES_PANEL_MIN_WIDTH, SIDEBAR_MIN_WIDTH } from 'modules/pace/pace.constants';
import { CHAT_SIDEBAR_STATE } from 'modules/pace/pace.types';
import { usePaceContext } from '@/modules/pace/pace.context';

const HANDLE_WIDTH = 8;
const PADDING = 16;
const MIN_MAIN_WIDTH = 100;

const FilesPanelResizeHandle = () => {
  const {
    filesPanelWidth,
    setFilesPanelWidth,
    persistFilesPanelWidth,
    setIsFilesPanelResizing,
    sidebarWidth,
    chatSidebarState,
    hasActivePanelTab,
    treeColumnWidth,
    isTreeSidebarOpen,
  } = usePaceContext();

  const dragStartXRef = useRef<number>(0);
  const dragStartWidthRef = useRef<number>(filesPanelWidth);
  const effectiveMaxWidthRef = useRef<number>(FILES_PANEL_MAX_WIDTH);

  const [isDragging, setIsDragging] = useState(false);

  const computeEffectiveMax = useCallback(() => {
    const isSidebar = chatSidebarState === CHAT_SIDEBAR_STATE.SIDEBAR;
    const chatSpace = isSidebar ? (hasActivePanelTab ? SIDEBAR_MIN_WIDTH : sidebarWidth + HANDLE_WIDTH) : 0;
    const mainSpace = hasActivePanelTab ? 0 : MIN_MAIN_WIDTH;
    const treeSpace = isTreeSidebarOpen ? treeColumnWidth + HANDLE_WIDTH : 0;

    const viewportWidth = window.innerWidth - PADDING;
    const available = viewportWidth - HANDLE_WIDTH - chatSpace - mainSpace - treeSpace;

    return Math.min(FILES_PANEL_MAX_WIDTH, Math.max(FILES_PANEL_MIN_WIDTH, available));
  }, [chatSidebarState, sidebarWidth, hasActivePanelTab, treeColumnWidth, isTreeSidebarOpen]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragStartXRef.current = e.clientX;
      dragStartWidthRef.current = filesPanelWidth;
      effectiveMaxWidthRef.current = computeEffectiveMax();

      setIsDragging(true);
      setIsFilesPanelResizing(true);
    },
    [filesPanelWidth, setIsFilesPanelResizing, computeEffectiveMax],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const delta = e.clientX - dragStartXRef.current;
      const newWidth = Math.min(
        effectiveMaxWidthRef.current,
        Math.max(FILES_PANEL_MIN_WIDTH, dragStartWidthRef.current - delta),
      );

      setFilesPanelWidth(newWidth);
    },
    [setFilesPanelWidth],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      const delta = e.clientX - dragStartXRef.current;
      const finalWidth = Math.min(
        effectiveMaxWidthRef.current,
        Math.max(FILES_PANEL_MIN_WIDTH, dragStartWidthRef.current - delta),
      );

      persistFilesPanelWidth(finalWidth);
      setIsDragging(false);
      setIsFilesPanelResizing(false);
    },
    [persistFilesPanelWidth, setIsFilesPanelResizing],
  );

  useEffect(() => {
    if (!isDragging) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsFilesPanelResizing(false);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, setIsFilesPanelResizing]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className='group relative -mx-1 flex h-full w-2 shrink-0 cursor-col-resize items-center justify-center select-none'
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

export default FilesPanelResizeHandle;
