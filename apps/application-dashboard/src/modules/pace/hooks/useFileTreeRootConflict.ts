import { useCallback, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useFileActions } from 'modules/pace/hooks/useFileActions';
import {
  CLIPBOARD_OPERATION,
  CONFLICT_RESOLUTION,
  type ConflictResolution,
  type FileConflict,
  type FileItem,
} from '@/modules/pace/components/files/file-tree.types';
import { generateKeepBothName } from '@/modules/pace/components/files/file-tree.utils';

interface UseFileTreeRootConflictProps {
  rootSiblingNames: string[];
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
}

interface UseFileTreeRootConflictReturn {
  fileConflict: FileConflict | null;
  setFileConflict: (conflict: FileConflict | null) => void;
  handleConflictResolve: (resolution: ConflictResolution) => Promise<void>;
  handleConflictCancel: () => void;
}

export const useFileTreeRootConflict = ({
  rootSiblingNames,
  onFileMoved,
}: UseFileTreeRootConflictProps): UseFileTreeRootConflictReturn => {
  const [fileConflict, setFileConflict] = useState<FileConflict | null>(null);

  const { copyItem, moveItem, deleteItem } = useFileActions();

  const handleConflictResolve = useCallback(
    async (resolution: ConflictResolution) => {
      if (!fileConflict) return;

      const { sourcePath, sourceName, sourceType, sourceSize, sourceOwner, destinationPath, operation } = fileConflict;

      setFileConflict(null);

      try {
        if (resolution === CONFLICT_RESOLUTION.KEEP_BOTH) {
          const newName = generateKeepBothName(sourceName, rootSiblingNames);

          if (operation === CLIPBOARD_OPERATION.COPY) {
            await copyItem(sourcePath, newName);
          } else {
            await moveItem(sourcePath, newName);

            const newFile: FileItem = {
              path: newName,
              name: newName,
              type: sourceType,
              size: sourceSize,
              mtime_ms: Date.now(),
              owner: sourceOwner,
            };

            onFileMoved?.(sourcePath, newFile);
          }
        } else if (resolution === CONFLICT_RESOLUTION.REPLACE) {
          deleteItem(destinationPath);

          if (operation === CLIPBOARD_OPERATION.COPY) {
            await copyItem(sourcePath, destinationPath);
          } else {
            await moveItem(sourcePath, destinationPath);

            const newFile: FileItem = {
              path: destinationPath,
              name: sourceName,
              type: sourceType,
              size: sourceSize,
              mtime_ms: Date.now(),
              owner: sourceOwner,
            };

            onFileMoved?.(sourcePath, newFile);
          }
        }
      } catch (error) {
        captureException(error);
        toast.error('Failed to resolve conflict');
      }
    },
    [fileConflict, rootSiblingNames, copyItem, moveItem, deleteItem, onFileMoved],
  );

  const handleConflictCancel = useCallback(() => {
    setFileConflict(null);
  }, []);

  return {
    fileConflict,
    setFileConflict,
    handleConflictResolve,
    handleConflictCancel,
  };
};
