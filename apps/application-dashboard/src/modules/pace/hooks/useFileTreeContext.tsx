'use client';

import { useMemo } from 'react';
import { useFileActionsContext } from '@/modules/pace/context/FileActionsContext';
import { useFileClipboard } from '@/modules/pace/context/FileClipboardContext';
import { useFileConflict } from '@/modules/pace/context/FileConflictContext';
import { useProtectedFolders } from '@/modules/pace/context/ProtectedFoldersContext';

export const useFileTreeContext = () => {
  const fileActions = useFileActionsContext();
  const clipboard = useFileClipboard();
  const conflict = useFileConflict();
  const protectedFolders = useProtectedFolders();

  return useMemo(
    () => ({
      ...fileActions,
      clipboard: clipboard.clipboard,
      setCopyClipboard: clipboard.setCopyClipboard,
      setCutClipboard: clipboard.setCutClipboard,
      clearClipboard: clipboard.clearClipboard,
      setConflict: conflict.setConflict,
      isProtectedRoot: protectedFolders.isProtectedRoot,
      isInvalidCrossMove: protectedFolders.isInvalidCrossMove,
      username: protectedFolders.username,
    }),
    [fileActions, clipboard, conflict, protectedFolders],
  );
};
