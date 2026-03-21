'use client';

import { createContext, type ReactNode, useContext, useMemo } from 'react';
import type { FileItem } from '@/modules/pace/components/files/file-tree.types';

interface LazyFileTreeContextValue {
  addOptimistic: (items: FileItem | FileItem[]) => void;
  removeOptimistic: (path: string) => void;
  confirmAddition: (path: string) => void;
  confirmDeletion: (path: string) => void;
  loadFolder: (path: string, options?: { silent?: boolean }) => Promise<boolean>;
}

const LazyFileTreeContext = createContext<LazyFileTreeContextValue | null>(null);

interface LazyFileTreeProviderProps {
  children: ReactNode;
  onAddOptimistic: (items: FileItem | FileItem[]) => void;
  onRemoveOptimistic: (path: string) => void;
  onConfirmAddition: (path: string) => void;
  onConfirmDeletion: (path: string) => void;
  onLoadFolder: (path: string, options?: { silent?: boolean }) => Promise<boolean>;
}

export const LazyFileTreeProvider = ({
  children,
  onAddOptimistic,
  onRemoveOptimistic,
  onConfirmAddition,
  onConfirmDeletion,
  onLoadFolder,
}: LazyFileTreeProviderProps) => {
  const value = useMemo<LazyFileTreeContextValue>(
    () => ({
      addOptimistic: onAddOptimistic,
      removeOptimistic: onRemoveOptimistic,
      confirmAddition: onConfirmAddition,
      confirmDeletion: onConfirmDeletion,
      loadFolder: onLoadFolder,
    }),
    [onAddOptimistic, onRemoveOptimistic, onConfirmAddition, onConfirmDeletion, onLoadFolder],
  );

  return <LazyFileTreeContext.Provider value={value}>{children}</LazyFileTreeContext.Provider>;
};

export const useLazyFileTreeContext = (): LazyFileTreeContextValue | null => {
  return useContext(LazyFileTreeContext);
};
