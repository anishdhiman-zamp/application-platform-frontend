'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

interface FileTreeNavigationContextType {
  revealedPath: string | null;
  revealPathInTree: (path: string) => void;
  registerRevealHandler: (handler: ((path: string) => void) | null) => void;
}

const FileTreeNavigationContext = createContext<FileTreeNavigationContextType | null>(null);

export const FileTreeNavigationProvider = ({ children }: { children: ReactNode }) => {
  const [revealedPath, setRevealedPath] = useState<string | null>(null);
  const handlerRef = useRef<((path: string) => void) | null>(null);

  const registerRevealHandler = useCallback((handler: ((path: string) => void) | null) => {
    handlerRef.current = handler;
  }, []);

  const revealPathInTree = useCallback((path: string) => {
    setRevealedPath(path);
    handlerRef.current?.(path);
  }, []);

  const value = useMemo(
    () => ({
      revealedPath,
      revealPathInTree,
      registerRevealHandler,
    }),
    [revealedPath, revealPathInTree, registerRevealHandler],
  );

  return <FileTreeNavigationContext.Provider value={value}>{children}</FileTreeNavigationContext.Provider>;
};

export const useFileTreeNavigation = (): FileTreeNavigationContextType => {
  const context = useContext(FileTreeNavigationContext);

  if (!context) {
    throw new Error('useFileTreeNavigation must be used within a FileTreeNavigationProvider');
  }

  return context;
};
