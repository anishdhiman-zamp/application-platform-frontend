'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLazyReadFileContentQuery, useLazyReadFileQuery, useWriteFileMutation } from '@/apis/filesystem';
import { getFileCategory, getFileExtension, getMediaUrl } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_CATEGORY, type FileCategory } from '@/modules/pace/components/files/files.constants';
import { useFileViewerContext } from '@/modules/pace/context/FileViewerContext';

const AUTO_SAVE_DELAY_MS = 1000;
const POLL_INTERVAL_MS = 1000;

interface UseFileViewerOptions {
  filePath: string | null;
  isActive?: boolean;
  onSaveSuccess?: () => void;
  onSaveError?: (error: unknown) => void;
  onLoadError?: (error: unknown) => void;
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
  mediaUrl: string | null;
}

export const useFileViewer = ({
  filePath,
  isActive = true,
  onSaveSuccess,
  onSaveError,
  onLoadError,
}: UseFileViewerOptions): UseFileViewerReturn => {
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);

  const [mediaMtime, setMediaMtime] = useState<number | null>(null);

  const { getFileState, initFileState, forceUpdateFileState, updateFileContent, markFileSaved } =
    useFileViewerContext();

  const [fetchFileMetadata] = useLazyReadFileQuery();
  const [fetchFileContent, { isLoading, isError, error }] = useLazyReadFileContentQuery();
  const [writeFile, { isLoading: isSaving }] = useWriteFileMutation();

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
    } catch (err: unknown) {
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
        onLoadError?.(err);
      }
    };

    loadFile();
  }, [filePath, isEditable, fetchFileMetadata, fetchFileContent, getFileState, initFileState, onLoadError]);

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

  // Polling for editable files - detect external changes
  useEffect(() => {
    if (!filePath || !isEditable || !isActive) return;

    const pollForChanges = async () => {
      const currentState = getFileState(filePath);

      if (!currentState || currentState.isDirty) return;

      try {
        const metadata = await fetchFileMetadata({ path: filePath }).unwrap();

        if (metadata.mtime_ms !== currentState.mtime_ms) {
          const content = await fetchFileContent({ path: filePath }).unwrap();

          forceUpdateFileState(filePath, content ?? '', metadata.mtime_ms);
        }
      } catch {
        // Silently ignore polling errors
      }
    };

    const intervalId = setInterval(pollForChanges, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [filePath, isEditable, isActive, getFileState, fetchFileMetadata, fetchFileContent, forceUpdateFileState]);

  // Polling for media files - detect external changes and update URL
  useEffect(() => {
    if (!filePath || isEditable || !isActive) return;

    const pollForMediaChanges = async () => {
      try {
        const metadata = await fetchFileMetadata({ path: filePath }).unwrap();

        if (mediaMtime !== null && metadata.mtime_ms !== mediaMtime) {
          setMediaMtime(metadata.mtime_ms);
        } else if (mediaMtime === null) {
          setMediaMtime(metadata.mtime_ms);
        }
      } catch {
        // Silently ignore polling errors
      }
    };

    pollForMediaChanges();

    const intervalId = setInterval(pollForMediaChanges, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [filePath, isEditable, isActive, mediaMtime, fetchFileMetadata]);

  const mediaUrl = useMemo(() => {
    if (!filePath || isEditable) return null;

    const baseUrl = getMediaUrl(filePath);

    // baseUrl already contains ?raw=true, so use & for additional params
    return mediaMtime ? `${baseUrl}&v=${mediaMtime}` : baseUrl;
  }, [filePath, isEditable, mediaMtime]);

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
    mediaUrl,
  };
};

export default useFileViewer;
