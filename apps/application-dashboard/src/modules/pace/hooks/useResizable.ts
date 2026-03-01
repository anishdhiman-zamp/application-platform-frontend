import { useCallback, useState } from 'react';

interface UseResizableOptions {
  initialWidth: number;
  minWidth: number;
  maxWidth: number;
  onResizeStart?: () => void;
  onResizeEnd?: (width: number) => void;
}

interface UseResizableReturn {
  width: number;
  isResizing: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
}

export const useResizable = ({
  initialWidth,
  minWidth,
  maxWidth,
  onResizeStart,
  onResizeEnd,
}: UseResizableOptions): UseResizableReturn => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      onResizeStart?.();

      let finalWidth = width;
      const handleMouseMove = (e: MouseEvent) => {
        const newWidth = e.clientX;
        const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);

        finalWidth = clampedWidth;
        setWidth(clampedWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        onResizeEnd?.(finalWidth);
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [minWidth, maxWidth, onResizeStart, onResizeEnd, width],
  );

  return {
    width,
    isResizing,
    handleMouseDown,
  };
};
