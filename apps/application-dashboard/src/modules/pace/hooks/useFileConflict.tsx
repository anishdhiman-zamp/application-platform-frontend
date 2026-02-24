'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useFileActions } from 'modules/pace/hooks/useFileActions';
import { useFileClipboard } from 'modules/pace/hooks/useFileClipboard';
import {
  CLIPBOARD_OPERATION,
  type ConflictResolution,
  type FileConflict,
  type FileItem,
} from '@/modules/pace/components/files/file-tree.types';
import { executeConflictResolution } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_TOAST_MESSAGES } from '@/modules/pace/components/files/files.constants';
import { useDynamicTabs } from '@/modules/pace/hooks/useDynamicTabs';

interface FileConflictContextValue {
  conflict: FileConflict | null;
  setConflict: (conflict: FileConflict | null) => void;
  resolveConflict: (resolution: ConflictResolution, siblingNames: string[]) => Promise<void>;
  cancelConflict: () => void;
}

const FileConflictContext = createContext<FileConflictContextValue | null>(null);

interface FileConflictProviderProps {
  children: ReactNode;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
}

export const FileConflictProvider = ({ children, onFileMoved }: FileConflictProviderProps) => {
  const [conflict, setConflict] = useState<FileConflict | null>(null);

  const { copyItem, moveItem, deleteItem } = useFileActions();
  const { clearClipboard } = useFileClipboard();
  const { updateTab } = useDynamicTabs();

  const resolveConflict = useCallback(
    async (resolution: ConflictResolution, siblingNames: string[]) => {
      if (!conflict) return;

      const currentConflict = conflict;

      setConflict(null);

      try {
        await executeConflictResolution(
          resolution,
          currentConflict,
          siblingNames,
          { copyItem, moveItem, deleteItem },
          { clearClipboard, onFileMoved },
        );

        const isMove = currentConflict.operation !== CLIPBOARD_OPERATION.COPY;

        if (isMove) {
          updateTab(currentConflict.sourcePath, currentConflict.destinationPath, currentConflict.sourceName);
        }
      } catch (error) {
        captureException(error);
        toast.error(FILE_TOAST_MESSAGES.FAILED_TO_RESOLVE_CONFLICT);
      }
    },
    [conflict, copyItem, moveItem, deleteItem, clearClipboard, onFileMoved, updateTab],
  );

  const cancelConflict = useCallback(() => {
    setConflict(null);
  }, []);

  const value = useMemo(
    () => ({
      conflict,
      setConflict,
      resolveConflict,
      cancelConflict,
    }),
    [conflict, resolveConflict, cancelConflict],
  );

  return <FileConflictContext.Provider value={value}>{children}</FileConflictContext.Provider>;
};

export const useFileConflict = (): FileConflictContextValue => {
  const context = useContext(FileConflictContext);

  if (!context) {
    throw new Error('useFileConflict must be used within a FileConflictProvider');
  }

  return context;
};
