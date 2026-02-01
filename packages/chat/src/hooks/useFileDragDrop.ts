'use client';

import { toast } from '@zamp-platform/ui';
import { useCallback, useEffect, useRef, useState } from 'react';

import { formatRejectedExtensions, isFileTypeAccepted } from '../utils/fileUpload';

export interface UseFileDragDropOptions {
  onFileDrop: (files: FileList) => void;
  disabled?: boolean;
  acceptedFileTypes?: string;
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

export const useFileDragDrop = ({
  onFileDrop,
  disabled = false,
  acceptedFileTypes,
}: UseFileDragDropOptions): UseFileDragDropReturn => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);
  const dropZoneRef = useRef<HTMLElement | null>(null);

  const checkFileType = useCallback(
    (file: File): boolean => isFileTypeAccepted(file, acceptedFileTypes),
    [acceptedFileTypes],
  );

  const processFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const acceptedFiles = fileArray.filter(checkFileType);
      const rejectedFiles = fileArray.filter((file) => !checkFileType(file));

      if (rejectedFiles.length > 0) {
        const rejectedExtensions = [...new Set(rejectedFiles.map((f) => `.${f.name.split('.').pop()?.toLowerCase()}`))];
        const extensionsText = formatRejectedExtensions(rejectedExtensions);
        toast.error?.(`${extensionsText} file type is not supported`);

        if (acceptedFiles.length === 0) {
          return;
        }
      }

      if (acceptedFiles.length > 0) {
        // Create a DataTransfer to convert the array back to FileList
        const dataTransfer = new DataTransfer();
        acceptedFiles.forEach((file) => dataTransfer.items.add(file));
        onFileDrop(dataTransfer.files);
      }
    },
    [checkFileType, onFileDrop],
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (disabled) return;

      dragCounterRef.current += 1;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragOver(true);
      }
    },
    [disabled],
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

      if (disabled) return;

      const files = e.dataTransfer?.files;
      processFiles(files);
    },
    [disabled, processFiles],
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
