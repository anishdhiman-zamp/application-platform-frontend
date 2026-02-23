'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

export interface FileState {
  content: string;
  originalContent: string;
  isDirty: boolean;
  mtime_ms?: number;
}

interface FileViewerContextType {
  getFileState: (path: string) => FileState | undefined;
  initFileState: (path: string, content: string, mtime_ms?: number) => void;
  updateFileContent: (path: string, content: string) => void;
  markFileSaved: (path: string, newMtime?: number) => void;
  removeFileState: (path: string) => void;
}

const FileViewerContext = createContext<FileViewerContextType | null>(null);

export const FileViewerProvider = ({ children }: { children: ReactNode }) => {
  const [fileStates, setFileStates] = useState<Map<string, FileState>>(new Map());
  const fileStatesRef = useRef(fileStates);

  fileStatesRef.current = fileStates;

  const getFileState = useCallback((path: string): FileState | undefined => {
    return fileStatesRef.current.get(path);
  }, []);

  const initFileState = useCallback((path: string, content: string, mtime_ms?: number) => {
    setFileStates((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(path);

      if (!existing) {
        newMap.set(path, {
          content,
          originalContent: content,
          isDirty: false,
          mtime_ms,
        });
      }

      return newMap;
    });
  }, []);

  const updateFileContent = useCallback((path: string, content: string) => {
    setFileStates((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(path);

      if (existing) {
        const isDirty = content !== existing.originalContent;

        newMap.set(path, {
          ...existing,
          content,
          isDirty,
        });
      }

      return newMap;
    });
  }, []);

  const markFileSaved = useCallback((path: string, newMtime?: number) => {
    setFileStates((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(path);

      if (existing) {
        newMap.set(path, {
          ...existing,
          originalContent: existing.content,
          isDirty: false,
          mtime_ms: newMtime ?? existing.mtime_ms,
        });
      }

      return newMap;
    });
  }, []);

  const removeFileState = useCallback((path: string) => {
    setFileStates((prev) => {
      const newMap = new Map(prev);

      newMap.delete(path);

      return newMap;
    });
  }, []);

  const value: FileViewerContextType = useMemo(
    () => ({
      getFileState,
      initFileState,
      updateFileContent,
      markFileSaved,
      removeFileState,
    }),
    [getFileState, initFileState, updateFileContent, markFileSaved, removeFileState],
  );

  return <FileViewerContext.Provider value={value}>{children}</FileViewerContext.Provider>;
};

export const useFileViewerContext = () => {
  const context = useContext(FileViewerContext);

  if (!context) {
    throw new Error('useFileViewerContext must be used within a FileViewerProvider');
  }

  return context;
};

export default FileViewerContext;
