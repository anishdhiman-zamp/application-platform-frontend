import { format } from 'date-fns';
import {
  FILE_TYPE,
  type FileItem,
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
 * Sorts tree nodes according to the specified criteria (folders and files are treated equally)
 */
export function sortTreeNodes(nodes: TreeNode[], sortBy: SortOption, sortDirection: SortDirection): TreeNode[] {
  const sorted = [...nodes].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'size':
        comparison = (a.size ?? 0) - (b.size ?? 0);
        break;
      case 'type':
        comparison = getFileExtension(a.name).localeCompare(getFileExtension(b.name));
        break;
      case 'date_modified':
      default:
        comparison = a.mtime_ms - b.mtime_ms;
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
