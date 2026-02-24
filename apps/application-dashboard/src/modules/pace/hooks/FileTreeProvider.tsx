'use client';

import { type ReactNode } from 'react';
import type { FileItem } from '@/modules/pace/components/files/file-tree.types';
import { FileActionsProvider } from '@/modules/pace/hooks/useFileActionsContext';
import { FileClipboardProvider } from '@/modules/pace/hooks/useFileClipboard';
import { FileConflictProvider } from '@/modules/pace/hooks/useFileConflict';
import { ProtectedFoldersProvider } from '@/modules/pace/hooks/useProtectedFolders';

interface FileTreeProviderProps {
  children: ReactNode;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
}

export const FileTreeProvider = ({ children, onFileMoved }: FileTreeProviderProps) => {
  return (
    <ProtectedFoldersProvider>
      <FileActionsProvider>
        <FileClipboardProvider>
          <FileConflictProvider onFileMoved={onFileMoved}>{children}</FileConflictProvider>
        </FileClipboardProvider>
      </FileActionsProvider>
    </ProtectedFoldersProvider>
  );
};
