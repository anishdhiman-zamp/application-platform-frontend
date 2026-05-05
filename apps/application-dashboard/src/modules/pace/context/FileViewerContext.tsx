'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { usePaceConversationContext } from '@/modules/pace/pace.context';

export interface FileState {
  content: string;
  originalContent: string;
  isDirty: boolean;
  mtime_ms?: number;
}

interface FileViewerContextType {
  getFileState: (path: string) => FileState | undefined;
  initFileState: (path: string, content: string, mtime_ms?: number) => void;
  forceUpdateFileState: (path: string, content: string, mtime_ms?: number) => void;
  updateFileContent: (path: string, content: string) => void;
  markFileSaved: (path: string, newMtime?: number) => void;
  removeFileState: (path: string) => void;
  updateFileStatePath: (oldPath: string, newPath: string) => void;
  updateFileStatePathsForFolder: (oldFolderPath: string, newFolderPath: string) => void;
}

const FileViewerContext = createContext<FileViewerContextType | null>(null);

const NO_CONVERSATION_KEY = '__none__';

type FileStatesByConversation = Map<string, Map<string, FileState>>;

const getBucket = (states: FileStatesByConversation, conversationKey: string): Map<string, FileState> | undefined => {
  return states.get(conversationKey);
};

const cloneStatesWithBucket = (
  states: FileStatesByConversation,
  conversationKey: string,
  bucket: Map<string, FileState>,
): FileStatesByConversation => {
  const next = new Map(states);

  next.set(conversationKey, bucket);

  return next;
};

export const FileViewerProvider = ({ children }: { children: ReactNode }) => {
  const { activeConversationId } = usePaceConversationContext();
  const [fileStates, setFileStates] = useState<FileStatesByConversation>(new Map());
  const fileStatesRef = useRef(fileStates);
  const conversationKeyRef = useRef<string>(activeConversationId ?? NO_CONVERSATION_KEY);

  fileStatesRef.current = fileStates;
  conversationKeyRef.current = activeConversationId ?? NO_CONVERSATION_KEY;

  const getFileState = useCallback((path: string): FileState | undefined => {
    return getBucket(fileStatesRef.current, conversationKeyRef.current)?.get(path);
  }, []);

  const initFileState = useCallback((path: string, content: string, mtime_ms?: number) => {
    const conversationKey = conversationKeyRef.current;

    setFileStates((prev) => {
      const existingBucket = prev.get(conversationKey);
      const newBucket = new Map(existingBucket ?? []);

      if (!newBucket.has(path)) {
        newBucket.set(path, {
          content,
          originalContent: content,
          isDirty: false,
          mtime_ms,
        });
      }

      return cloneStatesWithBucket(prev, conversationKey, newBucket);
    });
  }, []);

  const forceUpdateFileState = useCallback((path: string, content: string, mtime_ms?: number) => {
    const conversationKey = conversationKeyRef.current;

    setFileStates((prev) => {
      const existingBucket = prev.get(conversationKey);
      const newBucket = new Map(existingBucket ?? []);

      newBucket.set(path, {
        content,
        originalContent: content,
        isDirty: false,
        mtime_ms,
      });

      return cloneStatesWithBucket(prev, conversationKey, newBucket);
    });
  }, []);

  const updateFileContent = useCallback((path: string, content: string) => {
    const conversationKey = conversationKeyRef.current;

    setFileStates((prev) => {
      const existingBucket = prev.get(conversationKey);
      const newBucket = new Map(existingBucket ?? []);
      const existing = newBucket.get(path);

      if (existing) {
        const isDirty = content !== existing.originalContent;

        newBucket.set(path, {
          ...existing,
          content,
          isDirty,
        });
      } else {
        newBucket.set(path, {
          content,
          originalContent: '',
          isDirty: true,
        });
      }

      return cloneStatesWithBucket(prev, conversationKey, newBucket);
    });
  }, []);

  const markFileSaved = useCallback((path: string, newMtime?: number) => {
    const conversationKey = conversationKeyRef.current;

    setFileStates((prev) => {
      const existingBucket = prev.get(conversationKey);

      if (!existingBucket) return prev;

      const existing = existingBucket.get(path);

      if (!existing) return prev;

      const newBucket = new Map(existingBucket);

      newBucket.set(path, {
        ...existing,
        originalContent: existing.content,
        isDirty: false,
        mtime_ms: newMtime ?? existing.mtime_ms,
      });

      return cloneStatesWithBucket(prev, conversationKey, newBucket);
    });
  }, []);

  const removeFileState = useCallback((path: string) => {
    const conversationKey = conversationKeyRef.current;

    setFileStates((prev) => {
      const existingBucket = prev.get(conversationKey);

      if (!existingBucket || !existingBucket.has(path)) return prev;

      const newBucket = new Map(existingBucket);

      newBucket.delete(path);

      return cloneStatesWithBucket(prev, conversationKey, newBucket);
    });
  }, []);

  const updateFileStatePath = useCallback((oldPath: string, newPath: string) => {
    const conversationKey = conversationKeyRef.current;
    const currentBucket = fileStatesRef.current.get(conversationKey);
    const existing = currentBucket?.get(oldPath);

    if (currentBucket && existing) {
      const syncedBucket = new Map(currentBucket);

      syncedBucket.delete(oldPath);
      syncedBucket.set(newPath, existing);
      fileStatesRef.current = cloneStatesWithBucket(fileStatesRef.current, conversationKey, syncedBucket);
    }

    setFileStates((prev) => {
      const existingBucket = prev.get(conversationKey);
      const existingState = existingBucket?.get(oldPath);

      if (!existingBucket || !existingState) return prev;

      const newBucket = new Map(existingBucket);

      newBucket.delete(oldPath);
      newBucket.set(newPath, existingState);

      return cloneStatesWithBucket(prev, conversationKey, newBucket);
    });
  }, []);

  const updateFileStatePathsForFolder = useCallback((oldFolderPath: string, newFolderPath: string) => {
    const conversationKey = conversationKeyRef.current;
    const oldPrefix = oldFolderPath + '/';

    const currentBucket = fileStatesRef.current.get(conversationKey);

    if (currentBucket) {
      const updates: Array<{ oldPath: string; newPath: string; state: FileState }> = [];

      currentBucket.forEach((state, path) => {
        if (path === oldFolderPath || path.startsWith(oldPrefix)) {
          const newPath = path === oldFolderPath ? newFolderPath : newFolderPath + path.slice(oldFolderPath.length);

          updates.push({ oldPath: path, newPath, state });
        }
      });

      if (updates.length > 0) {
        const syncedBucket = new Map(currentBucket);

        updates.forEach(({ oldPath, newPath, state }) => {
          syncedBucket.delete(oldPath);
          syncedBucket.set(newPath, state);
        });
        fileStatesRef.current = cloneStatesWithBucket(fileStatesRef.current, conversationKey, syncedBucket);
      }
    }

    setFileStates((prev) => {
      const existingBucket = prev.get(conversationKey);

      if (!existingBucket) return prev;

      const folderUpdates: Array<{ oldPath: string; newPath: string; state: FileState }> = [];

      existingBucket.forEach((state, path) => {
        if (path === oldFolderPath || path.startsWith(oldPrefix)) {
          const newPath = path === oldFolderPath ? newFolderPath : newFolderPath + path.slice(oldFolderPath.length);

          folderUpdates.push({ oldPath: path, newPath, state });
        }
      });

      if (folderUpdates.length === 0) return prev;

      const newBucket = new Map(existingBucket);

      folderUpdates.forEach(({ oldPath, newPath, state }) => {
        newBucket.delete(oldPath);
        newBucket.set(newPath, state);
      });

      return cloneStatesWithBucket(prev, conversationKey, newBucket);
    });
  }, []);

  const value: FileViewerContextType = useMemo(
    () => ({
      getFileState,
      initFileState,
      forceUpdateFileState,
      updateFileContent,
      markFileSaved,
      removeFileState,
      updateFileStatePath,
      updateFileStatePathsForFolder,
    }),
    [
      getFileState,
      initFileState,
      forceUpdateFileState,
      updateFileContent,
      markFileSaved,
      removeFileState,
      updateFileStatePath,
      updateFileStatePathsForFolder,
    ],
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
