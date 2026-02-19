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

/**
 * File item as returned from the backend API
 */
export interface FileItem {
  path: string;
  name: string;
  type: FileType;
  size: number | null;
  mtime_ms: number;
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
  children?: TreeNode[];
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
}

/**
 * Props for the FilesPreview component
 */
export interface FilesPreviewProps {
  selectedFile: FileItem | null;
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
  onToggleExpand: (path: string) => void;
  onSelect: (path: string) => void;
}
