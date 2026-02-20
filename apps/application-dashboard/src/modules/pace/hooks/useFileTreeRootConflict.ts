import { useCallback, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useFileActions } from 'modules/pace/hooks/useFileActions';
import {
  CLIPBOARD_OPERATION,
  CONFLICT_RESOLUTION,
  type ConflictResolution,
  type FileConflict,
} from '@/modules/pace/components/files/file-tree.types';
import { generateKeepBothName } from '@/modules/pace/components/files/file-tree.utils';

interface UseFileTreeRootConflictProps {
  rootSiblingNames: string[];
}

interface UseFileTreeRootConflictReturn {
  fileConflict: FileConflict | null;
  setFileConflict: (conflict: FileConflict | null) => void;
  handleConflictResolve: (resolution: ConflictResolution) => Promise<void>;
  handleConflictCancel: () => void;
}

export const useFileTreeRootConflict = ({
  rootSiblingNames,
}: UseFileTreeRootConflictProps): UseFileTreeRootConflictReturn => {
  const [fileConflict, setFileConflict] = useState<FileConflict | null>(null);

  const { copyItem, moveItem, deleteItem } = useFileActions();

  const handleConflictResolve = useCallback(
    async (resolution: ConflictResolution) => {
      if (!fileConflict) return;

      const { sourcePath, sourceName, destinationPath, operation } = fileConflict;

      setFileConflict(null);

      try {
        if (resolution === CONFLICT_RESOLUTION.KEEP_BOTH) {
          const newName = generateKeepBothName(sourceName, rootSiblingNames);

          if (operation === CLIPBOARD_OPERATION.COPY) {
            await copyItem(sourcePath, newName);
          } else {
            await moveItem(sourcePath, newName);
          }
        } else if (resolution === CONFLICT_RESOLUTION.REPLACE) {
          deleteItem(destinationPath);

          if (operation === CLIPBOARD_OPERATION.COPY) {
            await copyItem(sourcePath, destinationPath);
          } else {
            await moveItem(sourcePath, destinationPath);
          }
        }
      } catch (error) {
        captureException(error);
        toast.error('Failed to resolve conflict');
      }
    },
    [fileConflict, rootSiblingNames, copyItem, moveItem, deleteItem],
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
