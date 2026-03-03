import type { FolderUploadProgress } from '@/modules/pace/components/files/file-tree.types';
import { defaultFnType } from '@/types/commonTypes';

export interface UploadProgress {
  fileName: string;
  filePath: string;
  loaded: number;
  total: number;
  percentage: number;
  status: string;
  uploadType: string;
}

export interface MultiFileUploadProgress {
  totalFiles: number;
  completedFiles: number;
  totalBytes: number;
  uploadedBytes: number;
}

export interface UploadState {
  isUploading: boolean;
  currentUpload: UploadProgress | null;
  activeUploads: Record<string, UploadProgress>;
  error: string | null;
  folderUpload: FolderUploadProgress | null;
  multiFileUpload: MultiFileUploadProgress | null;
}

export interface UploadProgressToastProps {
  uploadState: UploadState;
  onCancel: defaultFnType;
}

export type UploadToastType = 'folder' | 'chunked' | 'multi-file';
