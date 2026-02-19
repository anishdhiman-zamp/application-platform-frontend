import { format } from 'date-fns';
import {
  FILE_TYPE,
  type FileItem,
  type SortDirection,
  type SortOption,
  type TreeNode,
} from 'modules/pace/components/files/file-tree.types';
import { DATE_FORMAT, FILE_TYPE_LABELS } from 'modules/pace/components/files/files.constants';

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
 * Sorts tree nodes with folders first, then files, according to the specified criteria
 */
export function sortTreeNodes(nodes: TreeNode[], sortBy: SortOption, sortDirection: SortDirection): TreeNode[] {
  const sorted = [...nodes].sort((a, b) => {
    if (a.type === FILE_TYPE.DIRECTORY && b.type === FILE_TYPE.FILE) return -1;
    if (a.type === FILE_TYPE.FILE && b.type === FILE_TYPE.DIRECTORY) return 1;

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
 * Gets all ancestor folder paths for a given file path
 */
export function getAncestorPaths(filePath: string | null): Set<string> {
  const ancestors = new Set<string>();

  if (!filePath) return ancestors;

  const parts = filePath.split('/');

  for (let i = 1; i < parts.length; i++) {
    ancestors.add(parts.slice(0, i).join('/'));
  }

  return ancestors;
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
