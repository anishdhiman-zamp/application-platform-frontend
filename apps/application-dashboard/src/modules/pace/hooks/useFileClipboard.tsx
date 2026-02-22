'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import {
  CLIPBOARD_OPERATION,
  type ClipboardState,
  type FileType,
} from '@/modules/pace/components/files/file-tree.types';

interface FileClipboardContextValue {
  clipboard: ClipboardState | null;
  setCopyClipboard: (path: string, name: string, type: FileType, size: number | null, owner: string) => void;
  setCutClipboard: (path: string, name: string, type: FileType, size: number | null, owner: string) => void;
  clearClipboard: () => void;
}

const FileClipboardContext = createContext<FileClipboardContextValue | null>(null);

interface FileClipboardProviderProps {
  children: ReactNode;
}

export const FileClipboardProvider = ({ children }: FileClipboardProviderProps) => {
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);

  const setCopyClipboard = useCallback(
    (path: string, name: string, type: FileType, size: number | null, owner: string) => {
      setClipboard({ path, name, type, size, owner, operation: CLIPBOARD_OPERATION.COPY });
    },
    [],
  );

  const setCutClipboard = useCallback(
    (path: string, name: string, type: FileType, size: number | null, owner: string) => {
      setClipboard({ path, name, type, size, owner, operation: CLIPBOARD_OPERATION.CUT });
    },
    [],
  );

  const clearClipboard = useCallback(() => {
    setClipboard(null);
  }, []);

  const value = useMemo(
    () => ({
      clipboard,
      setCopyClipboard,
      setCutClipboard,
      clearClipboard,
    }),
    [clipboard, setCopyClipboard, setCutClipboard, clearClipboard],
  );

  return <FileClipboardContext.Provider value={value}>{children}</FileClipboardContext.Provider>;
};

export const useFileClipboard = (): FileClipboardContextValue => {
  const context = useContext(FileClipboardContext);

  if (!context) {
    throw new Error('useFileClipboard must be used within a FileClipboardProvider');
  }

  return context;
};
