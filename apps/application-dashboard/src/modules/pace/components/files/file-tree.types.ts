import type { LucideIcon } from 'lucide-react';

export type SortOption = 'date_modified' | 'name' | 'size' | 'type';
export type SortDirection = 'asc' | 'desc';

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
  onToggleExpand: (path: string) => void;
  onSelect: (path: string) => void;
}
