'use client';

import { createContext, type ReactNode, useContext, useMemo } from 'react';
import type { FolderUploadProgress } from '@/modules/pace/components/files/file-tree.types';
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
}

interface FileUploadContextValue {
  uploadState: UploadState;
  uploadFile: (file: File, targetPath: string) => Promise<void>;
  uploadFiles: (files: FileList | File[], basePath: string) => Promise<void>;
  uploadFolder: (files: FileList, basePath: string) => Promise<void>;
  cancelUpload: () => void;
  isUploading: boolean;
}

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

interface FileUploadProviderProps {
  children: ReactNode;
}

export const FileUploadProvider = ({ children }: FileUploadProviderProps) => {
  const { uploadState, uploadFile, uploadFiles, uploadFolder, cancelUpload, isUploading } = useFileUpload();

  const value = useMemo<FileUploadContextValue>(
    () => ({
      uploadState,
      uploadFile,
      uploadFiles,
      uploadFolder,
      cancelUpload,
      isUploading,
    }),
    [uploadState, uploadFile, uploadFiles, uploadFolder, cancelUpload, isUploading],
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
