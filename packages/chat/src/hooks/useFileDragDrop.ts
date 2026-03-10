'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseFileDragDropOptions {
  onFileDrop: (files: FileList) => void;
  disabled?: boolean;
}

export interface UseFileDragDropReturn {
  isDragOver: boolean;
  dropZoneProps: {
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  dropZoneRef: React.RefObject<HTMLElement | null>;
}

export const useFileDragDrop = ({ onFileDrop, disabled = false }: UseFileDragDropOptions): UseFileDragDropReturn => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);
  const dropZoneRef = useRef<HTMLElement | null>(null);

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      onFileDrop(files);
    },
    [onFileDrop],
  );

  const hasFiles = useCallback((dataTransfer: DataTransfer | null): boolean => {
    if (!dataTransfer?.types) return false;
    return Array.from(dataTransfer.types).includes('Files');
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      dragCounterRef.current += 1;
      if (hasFiles(e.dataTransfer)) {
        setIsDragOver(true);
      }
    },
    [disabled, hasFiles],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragOver(false);
      dragCounterRef.current = 0;

      if (disabled || !hasFiles(e.dataTransfer)) return;

      const files = e.dataTransfer?.files;
      processFiles(files);
    },
    [disabled, hasFiles, processFiles],
  );

  // Reset drag counter when disabled changes
  useEffect(() => {
    if (disabled) {
      setIsDragOver(false);
      dragCounterRef.current = 0;
    }
  }, [disabled]);

  return {
    isDragOver,
    dropZoneProps: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
    dropZoneRef,
  };
};

export default useFileDragDrop;
