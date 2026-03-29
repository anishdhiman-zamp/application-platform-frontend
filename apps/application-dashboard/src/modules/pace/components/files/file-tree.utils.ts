import { API_DOMAIN } from '@zamp-platform/api';
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
  type SourceItemInfo,
  type TreeNode,
} from '@/modules/pace/components/files/file-tree.types';
import {
  AUDIO_EXTENSIONS,
  DATE_FORMAT,
  DOCUMENT_EXTENSIONS,
  FILE_CATEGORY,
  FILE_TYPE_LABELS,
  type FileCategory,
  HTML_EXTENSIONS,
  IMAGE_EXTENSIONS,
  MARKDOWN_EXTENSIONS,
  MONACO_EDITABLE_EXTENSIONS,
  PDF_EXTENSIONS,
  PRESENTATION_EXTENSIONS,
  SPREADSHEET_EXTENSIONS,
  VIDEO_EXTENSIONS,
} from '@/modules/pace/components/files/files.constants';

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
 * Builds a media URL for accessing file content via the API.
 * Each path segment is URL-encoded to handle special characters.
 */
export function getMediaUrl(filePath: string): string {
  const encodedPath = filePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${API_DOMAIN}/files/${encodedPath}?raw=true`;
}

/**
 * Checks if an image is already cached in the browser.
 * Used to prevent loading flash when switching to already-loaded images.
 */
export function isImageCached(src: string): boolean {
  if (typeof window === 'undefined') return false;

  const img = new window.Image();

  img.src = src;

  return img.complete && img.naturalWidth > 0;
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
 * Formats timestamp to compact relative time string (e.g., "just now", "5m", "2h")
 * When showAgo is true, appends " ago" suffix (e.g., "5m ago", "2h ago")
 */
export function formatRelativeTime(timestamp: number, showAgo = false): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60_000);
  const suffix = showAgo ? ' ago' : '';

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m${suffix}`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h${suffix}`;

  const days = Math.floor(hours / 24);

  if (days < 30) return `${days}d${suffix}`;

  const months = Math.floor(days / 30);

  if (months < 12) return `${months}mo${suffix}`;

  const years = Math.floor(days / 365);

  return `${years}y${suffix}`;
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
 * Determines the file category based on extension for viewer selection
 */
export function getFileCategory(filename: string): FileCategory {
  const ext = getFileExtension(filename).toLowerCase();

  if (!ext) return FILE_CATEGORY.UNKNOWN;

  if ((IMAGE_EXTENSIONS as readonly string[]).includes(ext)) {
    return FILE_CATEGORY.IMAGE;
  }

  if ((AUDIO_EXTENSIONS as readonly string[]).includes(ext)) {
    return FILE_CATEGORY.AUDIO;
  }

  if ((VIDEO_EXTENSIONS as readonly string[]).includes(ext)) {
    return FILE_CATEGORY.VIDEO;
  }

  if ((PDF_EXTENSIONS as readonly string[]).includes(ext)) {
    return FILE_CATEGORY.PDF;
  }

  if ((MARKDOWN_EXTENSIONS as readonly string[]).includes(ext)) {
    return FILE_CATEGORY.MARKDOWN;
  }

  if ((HTML_EXTENSIONS as readonly string[]).includes(ext)) {
    return FILE_CATEGORY.HTML;
  }

  if ((SPREADSHEET_EXTENSIONS as readonly string[]).includes(ext)) {
    return FILE_CATEGORY.SPREADSHEET;
  }

  if ((PRESENTATION_EXTENSIONS as readonly string[]).includes(ext)) {
    return FILE_CATEGORY.PRESENTATION;
  }

  if ((DOCUMENT_EXTENSIONS as readonly string[]).includes(ext)) {
    return FILE_CATEGORY.DOCUMENT;
  }

  if ((MONACO_EDITABLE_EXTENSIONS as readonly string[]).includes(ext)) {
    return FILE_CATEGORY.CODE;
  }

  return FILE_CATEGORY.UNKNOWN;
}

/**
 * Checks if a file is editable (code or markdown)
 */
export function isFileEditable(filename: string): boolean {
  const category = getFileCategory(filename);

  return category === FILE_CATEGORY.CODE || category === FILE_CATEGORY.MARKDOWN || category === FILE_CATEGORY.HTML;
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
 * Matching children are shown at root level, not inside their parent folder,
 * to prevent duplicate keys when the folder is expanded.
 */
export function filterTreeNodes(nodes: TreeNode[], searchQuery: string): TreeNode[] {
  if (!searchQuery.trim()) return nodes;

  const query = searchQuery.toLowerCase();
  const results: TreeNode[] = [];
  const matchedPaths = new Set<string>();

  const collectMatchingPaths = (nodeList: TreeNode[]) => {
    for (const node of nodeList) {
      if (node.name.toLowerCase().includes(query)) {
        matchedPaths.add(node.path);
      }

      if (node.type === FILE_TYPE.DIRECTORY && node.children) {
        collectMatchingPaths(node.children);
      }
    }
  };

  collectMatchingPaths(nodes);

  const filterChildrenRecursively = (children: TreeNode[] | undefined): TreeNode[] | undefined => {
    if (!children) return undefined;

    return children
      .filter((child) => !matchedPaths.has(child.path))
      .map((child) => ({
        ...child,
        children: filterChildrenRecursively(child.children),
      }));
  };

  const collectMatches = (nodeList: TreeNode[]) => {
    for (const node of nodeList) {
      if (node.name.toLowerCase().includes(query)) {
        results.push({
          ...node,
          children: filterChildrenRecursively(node.children),
        });
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
 * Pre-computes a map of path -> visible descendant count for all nodes in the tree.
 * Avoids redundant O(n) traversals during rendering.
 */
export function buildDescendantCountMap(nodes: TreeNode[], expandedPaths: Set<string>): Map<string, number> {
  const map = new Map<string, number>();

  function compute(node: TreeNode): number {
    let count = 1;

    if (node.children && expandedPaths.has(node.path)) {
      for (const child of node.children) {
        count += compute(child);
      }
    }

    map.set(node.path, count);

    return count;
  }

  for (const node of nodes) {
    compute(node);
  }

  return map;
}

/**
 * Flattens a hierarchical tree into a flat array for virtualized rendering.
 * Only includes children of expanded folders.
 */
export function flattenTree(
  nodes: TreeNode[],
  expandedPaths: Set<string>,
  depth = 0,
  parentPath: string | null = null,
): FlatNode[] {
  const result: FlatNode[] = [];
  const siblingNames = nodes.map((n) => n.name);

  for (const node of nodes) {
    result.push({ ...node, depth, siblingNames, parentPath });

    if (node.children && expandedPaths.has(node.path)) {
      result.push(...flattenTree(node.children, expandedPaths, depth + 1, node.path));
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
export function generateDuplicateName(name: string, existingNames: string[] = []): string {
  const lastDotIndex = name.lastIndexOf('.');
  const hasExtension = lastDotIndex !== -1;
  const baseName = hasExtension ? name.slice(0, lastDotIndex) : name;
  const extension = hasExtension ? name.slice(lastDotIndex) : '';

  let candidate = `${baseName}_copy${extension}`;

  if (!existingNames.includes(candidate)) return candidate;

  let counter = 2;

  candidate = `${baseName}_copy_${counter}${extension}`;

  while (existingNames.includes(candidate)) {
    counter++;
    candidate = `${baseName}_copy_${counter}${extension}`;
  }

  return candidate;
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
  let newName = `${baseName}_${counter}${extension}`;

  while (existingNames.includes(newName)) {
    counter++;
    newName = `${baseName}_${counter}${extension}`;
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
  copyItem: (sourcePath: string, destinationPath: string, sourceItem?: SourceItemInfo) => Promise<void>;
  moveItem: (sourcePath: string, destinationPath: string, sourceItem?: SourceItemInfo) => Promise<void>;
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

  const sourceInfo: SourceItemInfo = { name: sourceName, type: sourceType, size: sourceSize, owner: sourceOwner };

  if (resolution === CONFLICT_RESOLUTION.KEEP_BOTH) {
    const newName = generateKeepBothName(sourceName, siblingNames);
    const parentPath = destinationPath.includes('/') ? destinationPath.slice(0, destinationPath.lastIndexOf('/')) : '';
    const newDestinationPath = parentPath ? `${parentPath}/${newName}` : newName;

    if (operation === CLIPBOARD_OPERATION.COPY) {
      await copyItem(sourcePath, newDestinationPath, { ...sourceInfo, name: newName });
    } else {
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
      await moveItem(sourcePath, newDestinationPath, { ...sourceInfo, name: newName });
    }
  } else if (resolution === CONFLICT_RESOLUTION.REPLACE) {
    await deleteItem(destinationPath);

    if (operation === CLIPBOARD_OPERATION.COPY) {
      await copyItem(sourcePath, destinationPath, sourceInfo);
    } else {
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
      await moveItem(sourcePath, destinationPath, sourceInfo);
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
  const sourceInfo: SourceItemInfo = { name: sourceName, type: sourceType, size: sourceSize, owner: sourceOwner };

  if (isCopy) {
    await copyItem(sourcePath, destinationPath, sourceInfo);
  } else {
    const newFile: FileItem = {
      path: destinationPath,
      name: sourceName,
      type: sourceType,
      size: sourceSize,
      mtime_ms: Date.now(),
      owner: sourceOwner,
    };

    onFileMoved?.(sourcePath, newFile);
    await moveItem(sourcePath, destinationPath, sourceInfo);
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

/**
 * Splits a filename into base name and extension.
 * For folders (isFile = false), the entire name is the base name with no extension.
 */
export function getFileNameParts(name: string, isFile = true): { baseName: string; extension: string } {
  if (!isFile) {
    return { baseName: name, extension: '' };
  }

  const lastDotIndex = name.lastIndexOf('.');

  if (lastDotIndex > 0) {
    return {
      baseName: name.slice(0, lastDotIndex),
      extension: name.slice(lastDotIndex),
    };
  }

  return { baseName: name, extension: '' };
}

/**
 * Checks if a new name would conflict with existing sibling names.
 * Excludes the current name from the check (for rename operations).
 */
export function checkDuplicateName(newName: string, siblingNames: string[], currentName?: string): boolean {
  if (!newName) return false;

  const namesToCheck = currentName ? siblingNames.filter((name) => name !== currentName) : siblingNames;

  return namesToCheck.some((name) => name === newName);
}

/**
 * Gets sibling file/folder names from a flat file list for a given file path.
 * Returns names of items in the same directory as the target file.
 */
export function getSiblingNamesFromFiles(files: FileItem[], filePath: string): string[] {
  const parentPath = getParentPath(filePath);
  const isRoot = parentPath === '/';

  return files
    .filter((file) => {
      const fileParentPath = getParentPath(file.path);

      if (isRoot) {
        return !file.path.includes('/');
      }

      return fileParentPath === parentPath;
    })
    .map((file) => file.name);
}
