'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLazyReadFileContentQuery, useLazyReadFileQuery, useWriteFileMutation } from '@/apis/filesystem';
import { getFileCategory, getFileExtension } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_CATEGORY, type FileCategory } from '@/modules/pace/components/files/files.constants';
import { useFileViewerContext } from '@/modules/pace/context/FileViewerContext';

const AUTO_SAVE_DELAY_MS = 1000;

interface UseFileViewerOptions {
  filePath: string | null;
  onSaveSuccess?: () => void;
  onSaveError?: (error: unknown) => void;
}

interface UseFileViewerReturn {
  content: string | null;
  originalContent: string | null;
  isDirty: boolean;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  fileCategory: FileCategory;
  fileExtension: string;
  isEditable: boolean;
  updateContent: (newContent: string) => void;
  isSaving: boolean;
  lastSavedAt: number | null;
  refetch: () => void;
}

export const useFileViewer = ({ filePath, onSaveSuccess, onSaveError }: UseFileViewerOptions): UseFileViewerReturn => {
  const { getFileState, initFileState, updateFileContent, markFileSaved } = useFileViewerContext();

  const [fetchFileMetadata] = useLazyReadFileQuery();
  const [fetchFileContent, { isLoading, isError, error }] = useLazyReadFileContentQuery();
  const [writeFile, { isLoading: isSaving }] = useWriteFileMutation();

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);

  const fileState = filePath ? getFileState(filePath) : undefined;

  const fileCategory = useMemo(() => {
    if (!filePath) return FILE_CATEGORY.UNKNOWN;

    return getFileCategory(filePath);
  }, [filePath]);

  const fileExtension = useMemo(() => {
    if (!filePath) return '';

    return getFileExtension(filePath);
  }, [filePath]);

  const isEditable = useMemo(() => {
    return (
      fileCategory === FILE_CATEGORY.CODE ||
      fileCategory === FILE_CATEGORY.MARKDOWN ||
      fileCategory === FILE_CATEGORY.HTML
    );
  }, [fileCategory]);

  useEffect(() => {
    const loadFile = async () => {
      if (!filePath) return;

      const existingState = getFileState(filePath);

      if (existingState) {
        return;
      }

      if (!isEditable) {
        return;
      }

      try {
        const [metadataResult, contentResult] = await Promise.all([
          fetchFileMetadata({ path: filePath }).unwrap(),
          fetchFileContent({ path: filePath }).unwrap(),
        ]);

        initFileState(filePath, contentResult ?? '', metadataResult.mtime_ms);
      } catch (err) {
        console.error('Failed to load file:', err);
      }
    };

    loadFile();
  }, [filePath, isEditable, fetchFileMetadata, fetchFileContent, getFileState, initFileState]);

  const saveFile = useCallback(async () => {
    if (!filePath) return;

    // If already saving, mark that we need another save after current one completes
    if (isSavingRef.current) {
      pendingSaveRef.current = true;

      return;
    }

    const currentState = getFileState(filePath);

    if (!currentState || !currentState.isDirty) return;

    isSavingRef.current = true;
    pendingSaveRef.current = false;

    try {
      const result = await writeFile({
        path: filePath,
        content: currentState.content,
      }).unwrap();

      markFileSaved(filePath, result.mtime_ms);
      onSaveSuccess?.();
    } catch (err) {
      console.error('Failed to save file:', err);
      onSaveError?.(err);
    } finally {
      isSavingRef.current = false;

      // If edits were made during save, trigger another save
      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        // Use setTimeout to avoid potential stack overflow and allow state to update
        setTimeout(() => saveFile(), 0);
      }
    }
  }, [filePath, getFileState, writeFile, markFileSaved, onSaveSuccess, onSaveError]);

  //Debounce the save file
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      saveFile();
    }, AUTO_SAVE_DELAY_MS);
  }, [saveFile]);

  const updateContent = useCallback(
    (newContent: string) => {
      if (!filePath) return;

      updateFileContent(filePath, newContent);
      scheduleAutoSave();
    },
    [filePath, updateFileContent, scheduleAutoSave],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Save on tab switch (when becoming inactive)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && fileState?.isDirty) {
        saveFile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fileState?.isDirty, saveFile]);

  const refetch = useCallback(() => {
    if (!filePath || !isEditable) return;

    Promise.all([fetchFileMetadata({ path: filePath }).unwrap(), fetchFileContent({ path: filePath }).unwrap()])
      .then(([metadataResult, contentResult]) => {
        initFileState(filePath, contentResult ?? '', metadataResult.mtime_ms);
      })
      .catch((err) => {
        console.error('Failed to refetch file:', err);
      });
  }, [filePath, isEditable, fetchFileMetadata, fetchFileContent, initFileState]);

  return {
    content: fileState?.content ?? null,
    originalContent: fileState?.originalContent ?? null,
    isDirty: fileState?.isDirty ?? false,
    isLoading,
    isError,
    error,
    fileCategory,
    fileExtension,
    isEditable,
    updateContent,
    isSaving,
    lastSavedAt: fileState?.mtime_ms ?? null,
    refetch,
  };
};

export default useFileViewer;
