'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useRef } from 'react';
import type { FileItem, FolderUploadProgress, UploadProgress } from '@/modules/pace/components/files/file-tree.types';
import { useFileUpload } from '@/modules/pace/hooks/useFileUpload';
import { defaultFnType } from '@/types/commonTypes';

interface MultiFileUploadProgress {
  totalFiles: number;
  completedFiles: number;
  totalBytes: number;
  uploadedBytes: number;
}

interface UploadState {
  isUploading: boolean;
  currentUpload: UploadProgress | null;
  activeUploads: Record<string, UploadProgress>;
  error: string | null;
  folderUpload: FolderUploadProgress | null;
  multiFileUpload: MultiFileUploadProgress | null;
  uploadingPath: string | null;
  uploadingItems: FileItem[];
  completedPaths: Set<string>;
}

interface FileUploadContextValue {
  uploadState: UploadState;
  uploadFile: (file: File, targetPath: string) => Promise<void>;
  uploadFiles: (files: FileList | File[], basePath: string) => Promise<void>;
  uploadFolder: (files: FileList, basePath: string) => Promise<void>;
  cancelUpload: defaultFnType;
  clearUploadingItems: defaultFnType;
  isUploading: boolean;
  uploadingPath: string | null;
  uploadingItems: FileItem[];
  uploadingPaths: Set<string>;
  registerLoadFolder: (fn: (path: string) => Promise<boolean>) => void;
}

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

interface FileUploadProviderProps {
  children: ReactNode;
}

export const FileUploadProvider = ({ children }: FileUploadProviderProps) => {
  const loadFolderRef = useRef<((path: string) => Promise<boolean>) | null>(null);

  const onUploadComplete = useCallback(async (targetPath: string) => {
    if (loadFolderRef.current) {
      await loadFolderRef.current(targetPath);
    }
  }, []);

  const registerLoadFolder = useCallback((fn: (path: string) => Promise<boolean>) => {
    loadFolderRef.current = fn;
  }, []);

  const { uploadState, uploadFile, uploadFiles, uploadFolder, cancelUpload, clearUploadingItems, isUploading } =
    useFileUpload({ onUploadComplete });

  const uploadingPaths = useMemo(
    () =>
      new Set(
        uploadState.uploadingItems.map((item) => item.path).filter((path) => !uploadState.completedPaths.has(path)),
      ),
    [uploadState.uploadingItems, uploadState.completedPaths],
  );

  const value = useMemo<FileUploadContextValue>(
    () => ({
      uploadState,
      uploadFile,
      uploadFiles,
      uploadFolder,
      cancelUpload,
      clearUploadingItems,
      isUploading,
      uploadingPath: uploadState.uploadingPath,
      uploadingItems: uploadState.uploadingItems,
      uploadingPaths,
      registerLoadFolder,
    }),
    [
      uploadState,
      uploadFile,
      uploadFiles,
      uploadFolder,
      cancelUpload,
      clearUploadingItems,
      isUploading,
      uploadingPaths,
      registerLoadFolder,
    ],
  );

  return <FileUploadContext.Provider value={value}>{children}</FileUploadContext.Provider>;
};

export const useFileUploadContext = (): FileUploadContextValue => {
  const context = useContext(FileUploadContext);

  if (!context) {
    throw new Error('useFileUploadContext must be used within a FileUploadProvider');
  }

  return context;
};
