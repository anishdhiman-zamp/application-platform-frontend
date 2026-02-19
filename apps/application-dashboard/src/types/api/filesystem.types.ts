// Filesystem Status Types
export interface FilesystemStatusResponse {
  status: 'active' | 'inactive';
  started_at: string | null;
}

// File/Directory Info Types
export type FileItemType = 'file' | 'directory';

export interface FileInfo {
  name: string;
  path: string;
  type: FileItemType;
  size: number;
  mtime_ms: number;
  created_at?: string;
  updated_at?: string;
}

// List Files Types
export interface ListFilesRequest {
  recursive?: boolean;
  path?: string;
}

export interface ListFilesResponse {
  files: FileInfo[];
  total_count: number;
  total_size: number;
}

// Create Item Types
export interface CreateItemRequest {
  path: string;
  type: FileItemType;
}

export interface CreateItemResponse {
  path: string;
  type: FileItemType;
  created: boolean;
}

// Write File Types
export interface WriteFileRequest {
  relative_path: string;
  content: string;
  expected_mtime_ms?: number;
}

export interface WriteFileResponse {
  path: string;
  mtime_ms: number;
  size: number;
}

// Read File Types
export interface ReadFileRequest {
  path: string;
}

export interface ReadFileResponse {
  file_content: string;
  mtime_ms: number;
  path_parts: string[];
  size: number;
  type: 'file';
}

// Read Directory Types
export interface ReadDirectoryResponse {
  directory_contents: FileInfo[];
  path_parts: string[];
  type: 'directory';
}

// Copy/Move Types
export interface CopyMoveRequest {
  source: string;
  destination: string;
}

export interface CopyMoveResponse {
  source: string;
  destination: string;
  success: boolean;
}

// Delete Types
export interface DeleteFileRequest {
  path: string;
}

export interface DeleteResponse {
  path: string;
  deleted: boolean;
}

// Direct Upload Types
export interface DirectUploadRequest {
  path: string;
  file: File;
}

export interface DirectUploadResponse {
  path: string;
  mtime_ms: number;
  size: number;
}

// Chunked Upload Types
export interface InitUploadRequest {
  path: string;
  file_name: string;
  total_bytes: number;
}

export interface InitUploadResponse {
  upload_id: string;
  chunk_size_bytes: number;
  total_chunks: number;
}

export interface UploadChunkRequest {
  uploadId: string;
  chunkIndex: number;
  chunkOffset: number;
  data: ArrayBuffer | Blob;
}

export interface UploadChunkResponse {
  upload_id: string;
  chunk_index: number;
  received_bytes: number;
}

export interface CompleteUploadRequest {
  upload_id: string;
}

export interface CompleteUploadResponse {
  path: string;
  mtime_ms: number;
  size: number;
}

export interface CancelUploadRequest {
  uploadId: string;
}

export interface CancelUploadResponse {
  upload_id: string;
  cancelled: boolean;
}
