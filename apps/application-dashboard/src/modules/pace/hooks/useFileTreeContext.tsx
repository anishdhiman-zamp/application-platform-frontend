'use client';

import { useMemo } from 'react';
import { useFileActionsContext } from '@/modules/pace/hooks/useFileActionsContext';
import { useFileClipboard } from '@/modules/pace/hooks/useFileClipboard';
import { useFileConflict } from '@/modules/pace/hooks/useFileConflict';
import { useProtectedFolders } from '@/modules/pace/hooks/useProtectedFolders';

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
