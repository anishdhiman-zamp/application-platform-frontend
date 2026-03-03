'use client';

import { createContext, type ReactNode, useContext, useMemo } from 'react';
import type { FileItem, FolderUploadProgress } from '@/modules/pace/components/files/file-tree.types';
import { useFileUpload } from '@/modules/pace/hooks/useFileUpload';

interface UploadProgress {
  fileName: string;
  filePath: string;
  loaded: number;
  total: number;
  percentage: number;
  status: string;
  uploadType: string;
}

interface UploadState {
  isUploading: boolean;
  currentUpload: UploadProgress | null;
  error: string | null;
  folderUpload: FolderUploadProgress | null;
  uploadingPath: string | null;
  uploadingItem: FileItem | null;
}

interface FileUploadContextValue {
  uploadState: UploadState;
  uploadFile: (file: File, targetPath: string) => Promise<void>;
  uploadFiles: (files: FileList | File[], basePath: string) => Promise<void>;
  uploadFolder: (files: FileList, basePath: string) => Promise<void>;
  cancelUpload: () => void;
  clearUploadingItem: () => void;
  isUploading: boolean;
  uploadingPath: string | null;
  uploadingItem: FileItem | null;
}

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

interface FileUploadProviderProps {
  children: ReactNode;
}

export const FileUploadProvider = ({ children }: FileUploadProviderProps) => {
  const { uploadState, uploadFile, uploadFiles, uploadFolder, cancelUpload, clearUploadingItem, isUploading } =
    useFileUpload();

  const value = useMemo<FileUploadContextValue>(
    () => ({
      uploadState,
      uploadFile,
      uploadFiles,
      uploadFolder,
      cancelUpload,
      clearUploadingItem,
      isUploading,
      uploadingPath: uploadState.uploadingPath,
      uploadingItem: uploadState.uploadingItem,
    }),
    [uploadState, uploadFile, uploadFiles, uploadFolder, cancelUpload, clearUploadingItem, isUploading],
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
