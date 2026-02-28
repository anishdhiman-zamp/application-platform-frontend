export const FILESYSTEM_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export type FilesystemStatus = (typeof FILESYSTEM_STATUS)[keyof typeof FILESYSTEM_STATUS];
export type FileItemType = 'file' | 'directory';

export interface FilesystemStatusResponse {
  status: FilesystemStatus;
  started_at: string | null;
}
export interface FileInfo {
  name: string;
  path: string;
  type: FileItemType;
  size: number;
  mtime_ms: number;
  owner: string;
}

// Base interface for read responses (shared fields)
interface BaseReadResponse {
  path_parts: string[];
  mtime_ms: number;
  file_extension: string | null;
  mime_type: string | null;
}

// List Files Types
export interface ListFilesRequest {
  depth?: number;
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
  owner?: string;
}

export interface CreateItemResponse {
  success: boolean;
  path: string;
  type: FileItemType;
  mtime_ms: number;
}

// Write File Types
export interface WriteFileRequest {
  path: string;
  content: string;
}

export interface WriteFileResponse {
  path: string;
  mtime_ms: number;
}

// Read File Types
export interface ReadFileRequest {
  path: string;
}

export interface ReadFileResponse extends BaseReadResponse {
  type: 'file';
  is_dir: false;
  file_content: string;
  file_size: number;
  size: number;
  directory_contents: null;
}

// Read Directory Types
export interface ReadDirectoryResponse extends BaseReadResponse {
  type: 'directory';
  is_dir: true;
  directory_contents: FileInfo[];
  file_content: null;
  file_size: null;
}

// Union type for read operations
export type ReadResponse = ReadFileResponse | ReadDirectoryResponse;

// Copy/Move Types
export interface CopyMoveRequest {
  source: string;
  destination: string;
}

export interface CopyMoveResponse {
  success: boolean;
  source: string;
  destination: string;
  path: string;
  mtime_ms: number;
}

// Delete Types
export interface DeleteRequest {
  path: string;
}

export interface DeleteResponse {
  success: boolean;
  path: string;
  mtime_ms: number;
}

// Direct Upload Types
export interface DirectUploadRequest {
  path: string;
  file: File;
}

export interface DirectUploadResponse {
  success: boolean;
  path: string;
  mtime_ms: number;
  bytes_written: number;
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
  target_path: string;
}

export interface UploadChunkRequest {
  upload_id: string;
  chunk_index: number;
  chunk_offset: number;
  data: ArrayBuffer | Blob;
  signal?: AbortSignal;
}

export interface UploadChunkResponse {
  chunk_index: number;
  bytes_received: number;
}

export interface CompleteUploadRequest {
  upload_id: string;
}

export interface CompleteUploadResponse {
  success: boolean;
  path: string;
  mtime_ms: number;
  bytes_written: number;
}

export interface CancelUploadRequest {
  upload_id: string;
}

export interface CancelUploadResponse {
  success: boolean;
}
