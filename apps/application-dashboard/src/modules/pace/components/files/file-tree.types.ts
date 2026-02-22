import type { LucideIcon } from 'lucide-react';

export const SORT_OPTION = {
  DATE_MODIFIED: 'date_modified',
  NAME: 'name',
  SIZE: 'size',
  TYPE: 'type',
} as const;

export type SortOption = (typeof SORT_OPTION)[keyof typeof SORT_OPTION];

export const SORT_DIRECTION = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortDirection = (typeof SORT_DIRECTION)[keyof typeof SORT_DIRECTION];

export interface ContextMenuAction {
  id: string;
  label: string;
  icon: LucideIcon;
  isDestructive?: boolean;
  fileOnly?: boolean;
  folderOnly?: boolean;
}

export const FILE_TYPE = {
  DIRECTORY: 'directory',
  FILE: 'file',
} as const;

export type FileType = (typeof FILE_TYPE)[keyof typeof FILE_TYPE];

export const CREATE_ITEM_TYPE = {
  FILE: 'file',
  FOLDER: 'folder',
} as const;

export type CreateItemType = (typeof CREATE_ITEM_TYPE)[keyof typeof CREATE_ITEM_TYPE];

export const CLIPBOARD_OPERATION = {
  COPY: 'copy',
  CUT: 'cut',
} as const;

export type ClipboardOperation = (typeof CLIPBOARD_OPERATION)[keyof typeof CLIPBOARD_OPERATION];

export interface ClipboardState {
  path: string;
  name: string;
  type: FileType;
  size: number | null;
  owner: string;
  operation: ClipboardOperation;
}

export const CONFLICT_RESOLUTION = {
  KEEP_BOTH: 'keep_both',
  REPLACE: 'replace',
  STOP: 'stop',
} as const;

export type ConflictResolution = (typeof CONFLICT_RESOLUTION)[keyof typeof CONFLICT_RESOLUTION];

export interface FileConflict {
  sourcePath: string;
  sourceName: string;
  sourceType: FileType;
  sourceSize: number | null;
  sourceOwner: string;
  destinationPath: string;
  operation: ClipboardOperation | 'move';
}

/**
 * File item as returned from the backend API
 */
export interface FileItem {
  path: string;
  name: string;
  type: FileType;
  size: number | null;
  mtime_ms: number;
  owner: string;
}

/**
 * Tree node structure for hierarchical display
 */
export interface TreeNode {
  path: string;
  name: string;
  type: FileType;
  size: number | null;
  mtime_ms: number;
  owner: string;
  children?: TreeNode[];
}

/**
 * Flattened tree node for virtualized rendering
 */
export interface FlatNode extends TreeNode {
  depth: number;
  siblingNames: string[];
}

/**
 * Props for the FileTree component
 */
export interface FileTreeProps {
  files: FileItem[];
  searchQuery: string;
  sortBy: SortOption;
  sortDirection: SortDirection;
  selectedPath?: string | null;
  onSelectFile?: (file: FileItem | null) => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
  onFileDeleted?: (deletedPath: string) => void;
  onFileCreated?: (newFile: FileItem) => void;
  onUploadFiles?: (files: FileList, targetPath: string) => void;
  onUploadFolder?: (files: FileList, targetPath: string) => void;
}

/**
 * Props for the FilesPreview component
 */
export interface FilesPreviewProps {
  selectedFile: FileItem | null;
}

export interface DropToSiblingData {
  sourcePath: string;
  sourceName: string;
  sourceType: FileType;
  sourceSize: number | null;
  sourceOwner: string;
  isCopy: boolean;
}

/**
 * Props for the FileTreeNode component
 */
export interface FileTreeNodeProps {
  node: TreeNode;
  depth: number;
  expandedPaths: Set<string>;
  selectedPath: string | null;
  originalNodeMap: Map<string, TreeNode>;
  siblingNames: string[];
  onToggleExpand: (path: string) => void;
  onSelect: (path: string) => void;
  onDropToSibling?: (data: DropToSiblingData) => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
  onFileDeleted?: (deletedPath: string) => void;
  onFileCreated?: (newFile: FileItem) => void;
  onUploadFiles?: (files: FileList, targetPath: string) => void;
  onUploadFolder?: (files: FileList, targetPath: string) => void;
  style?: React.CSSProperties;
}

export const UPLOAD_STATUS = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export type UploadStatus = (typeof UPLOAD_STATUS)[keyof typeof UPLOAD_STATUS];

export const UPLOAD_TYPE = {
  DIRECT: 'direct',
  CHUNKED: 'chunked',
} as const;

export type UploadType = (typeof UPLOAD_TYPE)[keyof typeof UPLOAD_TYPE];

export interface UploadProgress {
  fileName: string;
  filePath: string;
  loaded: number;
  total: number;
  percentage: number;
  status: UploadStatus;
  uploadType: UploadType;
  uploadId?: string;
}

export interface UploadState {
  isUploading: boolean;
  currentUpload: UploadProgress | null;
  error: string | null;
}

/**
 * File with relative path for folder uploads
 */
export interface FileWithPath {
  file: File;
  relativePath: string;
}

/**
 * Progress tracking for folder uploads
 */
export interface FolderUploadProgress {
  folderName: string;
  totalFiles: number;
  completedFiles: number;
  currentFile: UploadProgress | null;
  totalBytes: number;
  uploadedBytes: number;
}

/**
 * Extended upload state that includes folder upload progress
 */
export interface ExtendedUploadState extends UploadState {
  folderUpload: FolderUploadProgress | null;
}
