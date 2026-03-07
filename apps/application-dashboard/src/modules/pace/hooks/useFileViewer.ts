'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isNotFoundError } from '@zamp-platform/api';
import { useLazyReadFileContentQuery, useLazyReadFileQuery, useWriteFileMutation } from '@/apis/filesystem';
import { getFileCategory, getFileExtension, getMediaUrl } from '@/modules/pace/components/files/file-tree.utils';
import {
  FILE_CATEGORY,
  type FileCategory,
  TEXT_SPREADSHEET_EXTENSIONS,
} from '@/modules/pace/components/files/files.constants';
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
  isFileNotFound: boolean;
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
  const [fetchFileContent, { isLoading }] = useLazyReadFileContentQuery();
  const [writeFile, { isLoading: isSaving }] = useWriteFileMutation();

  const [isFileNotFound, setIsFileNotFound] = useState(false);

  const fileState = filePath ? getFileState(filePath) : undefined;

  const fileCategory = useMemo(() => {
    if (!filePath) return FILE_CATEGORY.UNKNOWN;

    return getFileCategory(filePath);
  }, [filePath]);

  const fileExtension = useMemo(() => {
    if (!filePath) return '';

    return getFileExtension(filePath);
  }, [filePath]);

  const isTextSpreadsheet = useMemo(() => {
    return (
      fileCategory === FILE_CATEGORY.SPREADSHEET &&
      (TEXT_SPREADSHEET_EXTENSIONS as readonly string[]).includes(fileExtension)
    );
  }, [fileCategory, fileExtension]);

  const isEditable = useMemo(() => {
    return (
      fileCategory === FILE_CATEGORY.CODE ||
      fileCategory === FILE_CATEGORY.MARKDOWN ||
      fileCategory === FILE_CATEGORY.HTML ||
      isTextSpreadsheet
    );
  }, [fileCategory, isTextSpreadsheet]);

  const mediaUrl = useMemo(() => {
    if (!filePath || isEditable) return null;

    const baseUrl = getMediaUrl(filePath);

    return mediaMtime ? `${baseUrl}&v=${mediaMtime}` : baseUrl;
  }, [filePath, isEditable, mediaMtime]);

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

  const loadFile = useCallback(async () => {
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
      if (isNotFoundError(err)) {
        setIsFileNotFound(true);
      } else {
        onLoadError?.(err);
      }
    }
  }, [filePath, isEditable, fetchFileMetadata, fetchFileContent, getFileState, initFileState, onLoadError]);

  // Load file on mount
  useEffect(() => {
    loadFile();
  }, [loadFile]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Polling for editable files - detect external changes
  useEffect(() => {
    if (!filePath || !isEditable || !isActive || isFileNotFound) return;

    let stopped = false;

    const pollForChanges = async () => {
      const currentState = getFileState(filePath);

      if (!currentState || currentState.isDirty) return;

      try {
        const metadata = await fetchFileMetadata({ path: filePath }).unwrap();

        if (metadata.mtime_ms !== currentState.mtime_ms) {
          const content = await fetchFileContent({ path: filePath }).unwrap();

          forceUpdateFileState(filePath, content ?? '', metadata.mtime_ms);
        }
      } catch (err) {
        if (isNotFoundError(err)) {
          stopped = true;
          setIsFileNotFound(true);
        } else {
          onLoadError?.(err);
        }
      }
    };

    const intervalId = setInterval(() => {
      if (!stopped) pollForChanges();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [
    filePath,
    isEditable,
    isActive,
    isFileNotFound,
    getFileState,
    fetchFileMetadata,
    fetchFileContent,
    forceUpdateFileState,
    onLoadError,
  ]);

  // Polling for media files - detect external changes and update URL
  useEffect(() => {
    if (!filePath || isEditable || !isActive || isFileNotFound) return;

    let stopped = false;

    const pollForMediaChanges = async () => {
      try {
        const metadata = await fetchFileMetadata({ path: filePath }).unwrap();

        if (mediaMtime !== null && metadata.mtime_ms !== mediaMtime) {
          setMediaMtime(metadata.mtime_ms);
        } else if (mediaMtime === null) {
          setMediaMtime(metadata.mtime_ms);
        }
      } catch (err) {
        if (isNotFoundError(err)) {
          stopped = true;
          setIsFileNotFound(true);
        } else {
          onLoadError?.(err);
        }
      }
    };

    pollForMediaChanges();

    const intervalId = setInterval(() => {
      if (!stopped) pollForMediaChanges();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [filePath, isEditable, isActive, isFileNotFound, mediaMtime, fetchFileMetadata, onLoadError]);

  return {
    content: fileState?.content ?? null,
    originalContent: fileState?.originalContent ?? null,
    isDirty: fileState?.isDirty ?? false,
    isLoading,
    isFileNotFound,
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
