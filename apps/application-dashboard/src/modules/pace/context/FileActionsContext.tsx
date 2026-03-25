'use client';

import { createContext, type ReactNode, useContext } from 'react';
import type { SourceItemInfo } from '@/modules/pace/components/files/file-tree.types';
import { useFileActions } from '@/modules/pace/hooks/useFileActions';

interface UseFileActionsReturn {
  createFile: (name: string, parentPath: string) => Promise<void>;
  createFolder: (name: string, parentPath: string) => Promise<void>;
  deleteItem: (path: string) => Promise<void>;
  renameItem: (oldPath: string, newName: string, sourceItem?: SourceItemInfo) => Promise<void>;
  moveItem: (sourcePath: string, destinationPath: string, sourceItem?: SourceItemInfo) => Promise<void>;
  copyItem: (sourcePath: string, destinationPath: string, sourceItem?: SourceItemInfo) => Promise<void>;
  duplicateItem: (path: string, sourceItem?: SourceItemInfo, siblingNames?: string[]) => Promise<void>;
  isCreating: boolean;
  isDeleting: boolean;
  isRenaming: boolean;
  isMoving: boolean;
  isCopying: boolean;
}

const FileActionsContext = createContext<UseFileActionsReturn | null>(null);

interface FileActionsProviderProps {
  children: ReactNode;
}

export const FileActionsProvider = ({ children }: FileActionsProviderProps) => {
  const actions = useFileActions();

  return <FileActionsContext.Provider value={actions}>{children}</FileActionsContext.Provider>;
};

export const useFileActionsContext = (): UseFileActionsReturn => {
  const context = useContext(FileActionsContext);

  if (!context) {
    throw new Error('useFileActionsContext must be used within FileActionsProvider');
  }

  return context;
};
