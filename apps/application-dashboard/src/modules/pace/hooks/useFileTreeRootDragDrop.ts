import { useCallback } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useFileActions } from 'modules/pace/hooks/useFileActions';
import {
  CLIPBOARD_OPERATION,
  type DropToSiblingData,
  type FileConflict,
} from '@/modules/pace/components/files/file-tree.types';

interface UseFileTreeRootDragDropProps {
  rootSiblingNames: string[];
  onConflict: (conflict: FileConflict) => void;
}

interface UseFileTreeRootDragDropReturn {
  handleDropToRootSibling: (data: DropToSiblingData) => Promise<void>;
  handleRootDragOver: (e: React.DragEvent) => void;
  handleRootDragLeave: (e: React.DragEvent) => void;
  handleRootDrop: (e: React.DragEvent) => Promise<void>;
}

export const useFileTreeRootDragDrop = ({
  rootSiblingNames,
  onConflict,
}: UseFileTreeRootDragDropProps): UseFileTreeRootDragDropReturn => {
  const { copyItem, moveItem } = useFileActions();

  const handleDropToRootSibling = useCallback(
    async (data: DropToSiblingData) => {
      const { sourcePath, sourceName, isCopy } = data;

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
        }
      } catch (error) {
        captureException(error);
        toast.error('Failed to move/copy');
      }
    },
    [copyItem, moveItem, rootSiblingNames, onConflict],
  );

  const handleRootDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = e.altKey ? 'copy' : 'move';
  }, []);

  const handleRootDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleRootDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();

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
            destinationPath,
            operation,
          });

          return;
        }

        if (e.altKey) {
          await copyItem(sourcePath, destinationPath);
        } else {
          await moveItem(sourcePath, destinationPath);
        }
      } catch (error) {
        captureException(error);
        toast.error('Failed to move/copy');
      }
    },
    [copyItem, moveItem, rootSiblingNames, onConflict],
  );

  return {
    handleDropToRootSibling,
    handleRootDragOver,
    handleRootDragLeave,
    handleRootDrop,
  };
};
