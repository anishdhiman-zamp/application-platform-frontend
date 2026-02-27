import type { FolderUploadProgress } from '@/modules/pace/components/files/file-tree.types';

export interface UploadProgress {
  fileName: string;
  filePath: string;
  loaded: number;
  total: number;
  percentage: number;
  status: string;
  uploadType: string;
}

export interface UploadState {
  isUploading: boolean;
  currentUpload: UploadProgress | null;
  error: string | null;
  folderUpload: FolderUploadProgress | null;
}

export interface UploadProgressToastProps {
  uploadState: UploadState;
  onCancel: () => void;
}

export type UploadToastType = 'folder' | 'chunked';
