import { useCallback } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useFileActions } from 'modules/pace/hooks/useFileActions';
import {
  CLIPBOARD_OPERATION,
  type DropToSiblingData,
  type FileConflict,
  type FileItem,
  type FileType,
} from '@/modules/pace/components/files/file-tree.types';

interface UseFileTreeRootDragDropProps {
  rootSiblingNames: string[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  onConflict: (conflict: FileConflict) => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
}

interface UseFileTreeRootDragDropReturn {
  handleDropToRootSibling: (data: DropToSiblingData) => Promise<void>;
  handleRootDragOver: (e: React.DragEvent) => void;
  handleRootDragLeave: (e: React.DragEvent) => void;
  handleRootDrop: (e: React.DragEvent) => Promise<void>;
}

export const useFileTreeRootDragDrop = ({
  rootSiblingNames,
  containerRef,
  onConflict,
  onFileMoved,
}: UseFileTreeRootDragDropProps): UseFileTreeRootDragDropReturn => {
  const { copyItem, moveItem } = useFileActions();

  const handleDropToRootSibling = useCallback(
    async (data: DropToSiblingData) => {
      const { sourcePath, sourceName, sourceType, sourceSize, sourceOwner, isCopy } = data;

      if (!sourcePath.includes('/')) {
        return;
      }

      const destinationPath = sourceName;

      if (!isCopy && sourcePath === destinationPath) {
        return;
      }

      const hasConflict = rootSiblingNames.includes(sourceName);
      const operation = isCopy ? CLIPBOARD_OPERATION.COPY : 'move';

      if (hasConflict) {
        onConflict({
          sourcePath,
          sourceName,
          sourceType,
          sourceSize,
          sourceOwner,
          destinationPath,
          operation,
        });

        return;
      }

      try {
        if (isCopy) {
          await copyItem(sourcePath, destinationPath);
        } else {
          await moveItem(sourcePath, destinationPath);

          const newFile: FileItem = {
            path: destinationPath,
            name: sourceName,
            type: sourceType as FileType,
            size: sourceSize,
            mtime_ms: Date.now(),
            owner: sourceOwner,
          };

          onFileMoved?.(sourcePath, newFile);
        }
      } catch (error) {
        captureException(error);
        toast.error('Failed to move/copy');
      }
    },
    [copyItem, moveItem, rootSiblingNames, onConflict, onFileMoved],
  );

  const handleRootDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      // Only show drop effect if hovering over the container itself (empty space)
      if (e.target === containerRef.current) {
        e.dataTransfer.dropEffect = e.altKey ? 'copy' : 'move';
      }
    },
    [containerRef],
  );

  const handleRootDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleRootDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();

      // Only handle drop if the target is the container itself (empty space)
      // This prevents capturing drops that should be handled by child nodes
      if (e.target !== containerRef.current) {
        return;
      }

      try {
        const rawData = e.dataTransfer.getData('application/json');

        if (!rawData) {
          return;
        }

        const data = JSON.parse(rawData);

        if (!data?.path || !data?.name) {
          return;
        }

        const sourcePath = data.path;
        const sourceName = data.name;
        const sourceType = data.type;
        const sourceSize = data.size ?? null;
        const sourceOwner = data.owner ?? '';

        if (!sourcePath.includes('/')) {
          return;
        }

        const destinationPath = sourceName;

        if (!e.altKey && sourcePath === destinationPath) {
          return;
        }

        const hasConflict = rootSiblingNames.includes(sourceName);
        const operation = e.altKey ? CLIPBOARD_OPERATION.COPY : 'move';

        if (hasConflict) {
          onConflict({
            sourcePath,
            sourceName,
            sourceType: sourceType as FileType,
            sourceSize,
            sourceOwner,
            destinationPath,
            operation,
          });

          return;
        }

        if (e.altKey) {
          await copyItem(sourcePath, destinationPath);
        } else {
          await moveItem(sourcePath, destinationPath);

          const newFile: FileItem = {
            path: destinationPath,
            name: sourceName,
            type: sourceType as FileType,
            size: sourceSize,
            mtime_ms: Date.now(),
            owner: sourceOwner,
          };

          onFileMoved?.(sourcePath, newFile);
        }
      } catch (error) {
        captureException(error);
        toast.error('Failed to move/copy');
      }
    },
    [copyItem, moveItem, rootSiblingNames, containerRef, onConflict, onFileMoved],
  );

  return {
    handleDropToRootSibling,
    handleRootDragOver,
    handleRootDragLeave,
    handleRootDrop,
  };
};
