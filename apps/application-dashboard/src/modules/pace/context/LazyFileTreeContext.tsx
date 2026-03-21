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
  addOptimistic: (items: FileItem | FileItem[]) => void;
  removeOptimistic: (path: string) => void;
  confirmAddition: (path: string) => void;
  confirmDeletion: (path: string) => void;
  loadFolder: (path: string, options?: { silent?: boolean }) => Promise<boolean>;
}

export const LazyFileTreeProvider = ({
  children,
  addOptimistic,
  removeOptimistic,
  confirmAddition,
  confirmDeletion,
  loadFolder,
}: LazyFileTreeProviderProps) => {
  const value = useMemo<LazyFileTreeContextValue>(
    () => ({ addOptimistic, removeOptimistic, confirmAddition, confirmDeletion, loadFolder }),
    [addOptimistic, removeOptimistic, confirmAddition, confirmDeletion, loadFolder],
  );

  return <LazyFileTreeContext.Provider value={value}>{children}</LazyFileTreeContext.Provider>;
};

export const useLazyFileTreeContext = (): LazyFileTreeContextValue | null => {
  return useContext(LazyFileTreeContext);
};
