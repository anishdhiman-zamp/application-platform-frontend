import { format } from 'date-fns';
import {
  CLIPBOARD_OPERATION,
  CONFLICT_RESOLUTION,
  type ConflictResolution,
  FILE_TYPE,
  type FileConflict,
  type FileItem,
  type FileType,
  type FlatNode,
  type SortDirection,
  type SortOption,
  type TreeNode,
} from '@/modules/pace/components/files/file-tree.types';
import { DATE_FORMAT, FILE_TYPE_LABELS } from '@/modules/pace/components/files/files.constants';

/**
 * Builds a hierarchical tree structure from a flat array of files.
 * Files are grouped by their path segments.
 */
export function buildFileTree(files: FileItem[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const rootNodes: TreeNode[] = [];

  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

  for (const file of sortedFiles) {
    const node: TreeNode = {
      path: file.path,
      name: file.name,
      type: file.type,
      size: file.size,
      mtime_ms: file.mtime_ms,
      owner: file.owner,
      children: file.type === FILE_TYPE.DIRECTORY ? [] : undefined,
    };

    nodeMap.set(file.path, node);

    const pathParts = file.path.split('/');

    if (pathParts.length === 1) {
      rootNodes.push(node);
    } else {
      const parentPath = pathParts.slice(0, -1).join('/');
      const parentNode = nodeMap.get(parentPath);

      if (parentNode && parentNode.children) {
        parentNode.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }
  }

  return rootNodes;
}

/**
 * Gets the file extension from a filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');

  if (lastDot === -1 || lastDot === 0) return '';

  return filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Formats file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '-';
  if (bytes <= 0) return '0 KB';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

/**
 * Formats timestamp to human-readable date string
 */
export function formatDate(timestamp: number): string {
  return format(new Date(timestamp), DATE_FORMAT);
}

/**
 * Gets a human-readable label for a file type based on extension
 */
export function getFileTypeLabel(name: string): string {
  const ext = getFileExtension(name).toUpperCase();

  if (!ext) return 'File';

  return FILE_TYPE_LABELS[ext] || `${ext} file`;
}

/**
 * Sorts tree nodes according to the specified criteria
 * For 'type' sort: directories first (asc) or files first (desc), with alphabetical order within each group
 */
export function sortTreeNodes(nodes: TreeNode[], sortBy: SortOption, sortDirection: SortDirection): TreeNode[] {
  const sorted = [...nodes].sort((firstNode, secondNode) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = firstNode.name.localeCompare(secondNode.name);
        break;
      case 'size':
        comparison = (firstNode.size ?? 0) - (secondNode.size ?? 0);
        break;
      case 'type': {
        const firstNodeIsDirectory = firstNode.type === FILE_TYPE.DIRECTORY;
        const secondNodeIsDirectory = secondNode.type === FILE_TYPE.DIRECTORY;

        if (firstNodeIsDirectory !== secondNodeIsDirectory) {
          comparison = firstNodeIsDirectory ? -1 : 1;
        } else {
          comparison = firstNode.name.localeCompare(secondNode.name);
        }
        break;
      }
      case 'date_modified':
        comparison = firstNode.mtime_ms - secondNode.mtime_ms;
        break;
      default:
        comparison = firstNode.name.localeCompare(secondNode.name);
        break;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return sorted.map((node) => ({
    ...node,
    children: node.children ? sortTreeNodes(node.children, sortBy, sortDirection) : undefined,
  }));
}

/**
 * Filters tree nodes by search query - only shows items whose name matches.
 * Does not include parent folders just because children match.
 */
export function filterTreeNodes(nodes: TreeNode[], searchQuery: string): TreeNode[] {
  if (!searchQuery.trim()) return nodes;

  const query = searchQuery.toLowerCase();
  const results: TreeNode[] = [];

  const collectMatches = (nodeList: TreeNode[]) => {
    for (const node of nodeList) {
      if (node.name.toLowerCase().includes(query)) {
        results.push(node);
      }

      if (node.type === FILE_TYPE.DIRECTORY && node.children) {
        collectMatches(node.children);
      }
    }
  };

  collectMatches(nodes);

  return results;
}

/**
 * Flattens a hierarchical tree into a flat array for virtualized rendering.
 * Only includes children of expanded folders.
 */
export function flattenTree(nodes: TreeNode[], expandedPaths: Set<string>, depth = 0): FlatNode[] {
  const result: FlatNode[] = [];
  const siblingNames = nodes.map((n) => n.name);

  for (const node of nodes) {
    result.push({ ...node, depth, siblingNames });

    if (node.children && expandedPaths.has(node.path)) {
      result.push(...flattenTree(node.children, expandedPaths, depth + 1));
    }
  }

  return result;
}

/**
 * Builds a map of path -> TreeNode for quick lookups
 */
export function buildNodeMap(nodes: TreeNode[]): Map<string, TreeNode> {
  const map = new Map<string, TreeNode>();

  const addToMap = (nodeList: TreeNode[]) => {
    for (const node of nodeList) {
      map.set(node.path, node);

      if (node.children) {
        addToMap(node.children);
      }
    }
  };

  addToMap(nodes);

  return map;
}

/**
 * Builds a full path from parent path and name
 */
export function buildFullPath(parentPath: string, name: string): string {
  if (parentPath === '/' || parentPath === '') {
    return name;
  }

  return `${parentPath}/${name}`;
}

/**
 * Gets the parent path from a full path
 */
export function getParentPath(path: string): string {
  const lastSlashIndex = path.lastIndexOf('/');

  if (lastSlashIndex === -1) {
    return '/';
  }

  return path.slice(0, lastSlashIndex) || '/';
}

/**
 * Generates a duplicate name by appending _copy before the extension
 */
export function generateDuplicateName(name: string): string {
  const lastDotIndex = name.lastIndexOf('.');

  if (lastDotIndex === -1) {
    return `${name}_copy`;
  }

  const baseName = name.slice(0, lastDotIndex);
  const extension = name.slice(lastDotIndex);

  return `${baseName}_copy${extension}`;
}

/**
 * Generates a unique "keep both" name by appending a counter before the extension
 */
export function generateKeepBothName(name: string, existingNames: string[]): string {
  const lastDotIndex = name.lastIndexOf('.');
  const hasExtension = lastDotIndex !== -1;
  const baseName = hasExtension ? name.slice(0, lastDotIndex) : name;
  const extension = hasExtension ? name.slice(lastDotIndex) : '';

  let counter = 2;
  let newName = `${baseName} ${counter}${extension}`;

  while (existingNames.includes(newName)) {
    counter++;
    newName = `${baseName} ${counter}${extension}`;
  }

  return newName;
}

/**
 * Check if a path represents a protected root folder (org_slug or username)
 */
export function isProtectedRootFolder(path: string, orgSlug: string, username: string): boolean {
  if (!orgSlug && !username) return false;

  return path === orgSlug || path === username;
}

/**
 * Check if a move/copy operation from source to destination is invalid
 * because it involves moving a protected root folder into another protected root folder
 */
export function isInvalidCrossProtectedMove(
  sourcePath: string,
  destinationPath: string,
  orgSlug: string,
  username: string,
): boolean {
  const sourceIsProtected = isProtectedRootFolder(sourcePath, orgSlug, username);

  if (!sourceIsProtected) return false;

  const destIsInsideOtherProtected =
    (sourcePath === orgSlug && (destinationPath === username || destinationPath.startsWith(`${username}/`))) ||
    (sourcePath === username && (destinationPath === orgSlug || destinationPath.startsWith(`${orgSlug}/`)));

  return destIsInsideOtherProtected;
}

/**
 * Get the root folder name from a path
 */
export function getRootFolderFromPath(path: string): string {
  const segments = path.split('/');

  return segments[0] || '';
}

/**
 * Check if a path is a child of a protected root folder (not the root itself)
 */
export function isChildOfProtectedFolder(path: string, orgSlug: string, username: string): boolean {
  if (!path.includes('/')) return false;

  const rootFolder = getRootFolderFromPath(path);

  return rootFolder === orgSlug || rootFolder === username;
}

export interface FileActions {
  copyItem: (sourcePath: string, destinationPath: string) => Promise<void>;
  moveItem: (sourcePath: string, destinationPath: string) => Promise<void>;
  deleteItem: (path: string) => Promise<void>;
}

interface ConflictCallbacks {
  clearClipboard?: () => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
}

/**
 * Executes conflict resolution logic for file operations.
 * Centralizes the duplicated conflict resolution code from multiple hooks.
 */
export async function executeConflictResolution(
  resolution: ConflictResolution,
  conflict: FileConflict,
  siblingNames: string[],
  actions: FileActions,
  callbacks: ConflictCallbacks,
): Promise<void> {
  const { sourcePath, sourceName, sourceType, sourceSize, sourceOwner, destinationPath, operation } = conflict;
  const { copyItem, moveItem, deleteItem } = actions;
  const { clearClipboard, onFileMoved } = callbacks;

  if (resolution === CONFLICT_RESOLUTION.KEEP_BOTH) {
    const newName = generateKeepBothName(sourceName, siblingNames);
    const parentPath = destinationPath.includes('/') ? destinationPath.slice(0, destinationPath.lastIndexOf('/')) : '';
    const newDestinationPath = parentPath ? `${parentPath}/${newName}` : newName;

    if (operation === CLIPBOARD_OPERATION.COPY) {
      await copyItem(sourcePath, newDestinationPath);
    } else {
      await moveItem(sourcePath, newDestinationPath);

      if (operation === CLIPBOARD_OPERATION.CUT) {
        clearClipboard?.();
      }

      const newFile: FileItem = {
        path: newDestinationPath,
        name: newName,
        type: sourceType,
        size: sourceSize,
        mtime_ms: Date.now(),
        owner: sourceOwner,
      };

      onFileMoved?.(sourcePath, newFile);
    }
  } else if (resolution === CONFLICT_RESOLUTION.REPLACE) {
    await deleteItem(destinationPath);

    if (operation === CLIPBOARD_OPERATION.COPY) {
      await copyItem(sourcePath, destinationPath);
    } else {
      await moveItem(sourcePath, destinationPath);

      if (operation === CLIPBOARD_OPERATION.CUT) {
        clearClipboard?.();
      }

      const newFile: FileItem = {
        path: destinationPath,
        name: sourceName,
        type: sourceType,
        size: sourceSize,
        mtime_ms: Date.now(),
        owner: sourceOwner,
      };

      onFileMoved?.(sourcePath, newFile);
    }
  }
}

/**
 * Parsed drag data from dataTransfer
 */
export interface ParsedDragData {
  sourcePath: string;
  sourceName: string;
  sourceType: FileType;
  sourceSize: number | null;
  sourceOwner: string;
}

/**
 * Parses drag data from a drag event's dataTransfer.
 * Returns null if the data is invalid or missing.
 */
export function parseDragData(e: React.DragEvent): ParsedDragData | null {
  try {
    const rawData = e.dataTransfer.getData('application/json');

    if (!rawData) {
      return null;
    }

    const data = JSON.parse(rawData);

    if (!data?.path || !data?.name) {
      return null;
    }

    return {
      sourcePath: data.path,
      sourceName: data.name,
      sourceType: data.type as FileType,
      sourceSize: data.size ?? null,
      sourceOwner: data.owner ?? '',
    };
  } catch {
    return null;
  }
}

interface ExecuteMoveOrCopyParams {
  sourcePath: string;
  sourceName: string;
  sourceType: FileType;
  sourceSize: number | null;
  sourceOwner: string;
  destinationPath: string;
  isCopy: boolean;
  actions: Pick<FileActions, 'copyItem' | 'moveItem'>;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
}

/**
 * Executes a move or copy operation.
 * Centralizes the duplicated move/copy execution code from multiple hooks.
 */
export async function executeMoveOrCopy({
  sourcePath,
  sourceName,
  sourceType,
  sourceSize,
  sourceOwner,
  destinationPath,
  isCopy,
  actions,
  onFileMoved,
}: ExecuteMoveOrCopyParams): Promise<void> {
  const { copyItem, moveItem } = actions;

  if (isCopy) {
    await copyItem(sourcePath, destinationPath);
  } else {
    await moveItem(sourcePath, destinationPath);

    const newFile: FileItem = {
      path: destinationPath,
      name: sourceName,
      type: sourceType,
      size: sourceSize,
      mtime_ms: Date.now(),
      owner: sourceOwner,
    };

    onFileMoved?.(sourcePath, newFile);
  }
}

/**
 * Result of paste validation
 */
export type PasteValidationResult =
  | { valid: false; reason: 'no-op' | 'invalid-target' }
  | { valid: true; hasConflict: boolean; destinationPath: string };

/**
 * Validates a paste operation and returns the result.
 */
export function validatePasteOperation(
  clipboard: { path: string; name: string; operation: string },
  targetPath: string,
  childrenNames: string[],
): PasteValidationResult {
  const destinationPath = `${targetPath}/${clipboard.name}`;

  if (clipboard.operation === 'cut' && clipboard.path === destinationPath) {
    return { valid: false, reason: 'no-op' };
  }

  const isInvalidTarget = targetPath === clipboard.path || targetPath.startsWith(`${clipboard.path}/`);

  if (isInvalidTarget) {
    return { valid: false, reason: 'invalid-target' };
  }

  const hasConflict = childrenNames.includes(clipboard.name);

  return { valid: true, hasConflict, destinationPath };
}
