'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import { FILE_TREE_COLUMN_MAX_WIDTH, FILE_TREE_COLUMN_MIN_WIDTH } from 'modules/pace/pace.constants';
import { usePaceContext } from '@/modules/pace/pace.context';

const FilesPanelInternalResizeHandle = () => {
  const { treeColumnWidth, setTreeColumnWidth, persistTreeColumnWidth, setIsTreeColumnResizing } = usePaceContext();

  const dragStartXRef = useRef<number>(0);
  const dragStartWidthRef = useRef<number>(treeColumnWidth);

  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragStartXRef.current = e.clientX;
      dragStartWidthRef.current = treeColumnWidth;

      setIsDragging(true);
      setIsTreeColumnResizing(true);
    },
    [treeColumnWidth, setIsTreeColumnResizing],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const delta = e.clientX - dragStartXRef.current;
      const newWidth = Math.min(
        FILE_TREE_COLUMN_MAX_WIDTH,
        Math.max(FILE_TREE_COLUMN_MIN_WIDTH, dragStartWidthRef.current + delta),
      );

      setTreeColumnWidth(newWidth);
    },
    [setTreeColumnWidth],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      const delta = e.clientX - dragStartXRef.current;
      const finalWidth = Math.min(
        FILE_TREE_COLUMN_MAX_WIDTH,
        Math.max(FILE_TREE_COLUMN_MIN_WIDTH, dragStartWidthRef.current + delta),
      );

      persistTreeColumnWidth(finalWidth);
      setIsDragging(false);
      setIsTreeColumnResizing(false);
    },
    [persistTreeColumnWidth, setIsTreeColumnResizing],
  );

  useEffect(() => {
    if (!isDragging) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsTreeColumnResizing(false);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, setIsTreeColumnResizing]);

  return (
    <div
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

export default FilesPanelInternalResizeHandle;
