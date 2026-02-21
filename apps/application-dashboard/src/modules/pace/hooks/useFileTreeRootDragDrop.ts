import { useCallback } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useFileActions } from 'modules/pace/hooks/useFileActions';
import {
  CLIPBOARD_OPERATION,
  type DropToSiblingData,
  type FileItem,
} from '@/modules/pace/components/files/file-tree.types';
import { executeMoveOrCopy, parseDragData } from '@/modules/pace/components/files/file-tree.utils';
import { useFileConflict } from '@/modules/pace/hooks/useFileConflict';

interface UseFileTreeRootDragDropProps {
  rootSiblingNames: string[];
  containerRef: React.RefObject<HTMLDivElement | null>;
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
  onFileMoved,
}: UseFileTreeRootDragDropProps): UseFileTreeRootDragDropReturn => {
  const { copyItem, moveItem } = useFileActions();
  const { setConflict } = useFileConflict();

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
        setConflict({
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
        await executeMoveOrCopy({
          sourcePath,
          sourceName,
          sourceType,
          sourceSize,
          sourceOwner,
          destinationPath,
          isCopy,
          actions: { copyItem, moveItem },
          onFileMoved,
        });
      } catch (error) {
        captureException(error);
        toast.error('Failed to move/copy');
      }
    },
    [copyItem, moveItem, rootSiblingNames, setConflict, onFileMoved],
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
        const dragData = parseDragData(e);

        if (!dragData) {
          return;
        }

        const { sourcePath, sourceName, sourceType, sourceSize, sourceOwner } = dragData;

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
          setConflict({
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

        await executeMoveOrCopy({
          sourcePath,
          sourceName,
          sourceType,
          sourceSize,
          sourceOwner,
          destinationPath,
          isCopy: e.altKey,
          actions: { copyItem, moveItem },
          onFileMoved,
        });
      } catch (error) {
        captureException(error);
        toast.error('Failed to move/copy');
      }
    },
    [copyItem, moveItem, rootSiblingNames, containerRef, setConflict, onFileMoved],
  );

  return {
    handleDropToRootSibling,
    handleRootDragOver,
    handleRootDragLeave,
    handleRootDrop,
  };
};
