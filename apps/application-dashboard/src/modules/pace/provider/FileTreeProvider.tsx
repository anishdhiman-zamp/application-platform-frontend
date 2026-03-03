'use client';

import { type ReactNode } from 'react';
import type { FileItem } from '@/modules/pace/components/files/file-tree.types';
import { FileActionsProvider } from '@/modules/pace/context/FileActionsContext';
import { FileClipboardProvider } from '@/modules/pace/context/FileClipboardContext';
import { FileConflictProvider } from '@/modules/pace/context/FileConflictContext';
import { ProtectedFoldersProvider } from '@/modules/pace/context/ProtectedFoldersContext';

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
