import { FilesystemApi } from '@/apis/filesystem';
import { FILE_TYPE, type FileItem } from '@/modules/pace/components/files/file-tree.types';
import type { RootState } from '@/store';
import type { ListFilesRequest, ListFilesResponse } from '@/types/api/filesystem.types';
import { getStoredExpandedPaths } from '@/utils/localstorage';

/** Depth passed to `listFiles` for lazy folder loading (must match hook + API usage). */
export const LAZY_FILE_TREE_FETCH_DEPTH = 2;

export interface LazyFileTreeCacheSnapshot {
  files: FileItem[];
  loadedFolders: Set<string>;
  hasCachedData: boolean;
}

/**
 * Number of path segments (split on `/`). Empty string is depth 0.
 */
export function getPathDepth(path: string): number {
  if (!path) return 0;

  return path.split('/').length;
}

/**
 * Groups path strings by {@link getPathDepth} and returns a map sorted by ascending depth.
 * Used to restore expanded folders from localStorage in parent-before-child order.
 */
export function groupByDepth(paths: string[]): Map<number, string[]> {
  const map = new Map<number, string[]>();

  for (const p of paths) {
    const depth = getPathDepth(p);
    const existing = map.get(depth) ?? [];

    existing.push(p);
    map.set(depth, existing);
  }

  return new Map([...map.entries()].sort(([a], [b]) => a - b));
}

/**
 * True if `childPath` is a direct or nested descendant of `parentPath` (path-prefix rule).
 * Root parent (`''`) matches top-level paths (no `/`).
 */
export function isChildOf(childPath: string, parentPath: string): boolean {
  if (!parentPath) return !childPath.includes('/');

  return childPath.startsWith(parentPath + '/');
}

/** Parent directory path segment; root files use `''`. */
export function getDirectParent(path: string): string {
  const idx = path.lastIndexOf('/');

  return idx === -1 ? '' : path.slice(0, idx);
}

/**
 * Reads fulfilled `listFiles` data from the RTK Query cache without subscribing.
 */
export function selectCachedListFiles(state: RootState, args: ListFilesRequest): ListFilesResponse | undefined {
  const result = FilesystemApi.endpoints.listFiles.select(args)(state);

  return result?.data;
}

/**
 * Builds initial lazy-tree state from Redux: root `listFiles` plus any cached subfolder
 * responses for paths stored in expanded-paths localStorage. Used on mount so the tree can
 * render from cache immediately (no flash) before background refetch.
 */
export function buildCacheSnapshot(state: RootState): LazyFileTreeCacheSnapshot {
  const rootData = selectCachedListFiles(state, { depth: LAZY_FILE_TREE_FETCH_DEPTH });

  if (!rootData) {
    return { files: [], loadedFolders: new Set(), hasCachedData: false };
  }

  const allFiles: FileItem[] = [...(rootData.files as FileItem[])];
  const loadedFolders = new Set<string>();

  loadedFolders.add('');

  const rootDirs = rootData.files.filter(
    (f) => f.type === FILE_TYPE.DIRECTORY && getPathDepth(f.path) <= LAZY_FILE_TREE_FETCH_DEPTH,
  );

  for (const dir of rootDirs) {
    loadedFolders.add(dir.path);
  }

  const storedPaths = getStoredExpandedPaths();

  if (storedPaths.length > 0) {
    const byDepth = groupByDepth(storedPaths);

    for (const [, paths] of byDepth) {
      for (const p of paths) {
        if (loadedFolders.has(p)) continue;

        const parent = getDirectParent(p);

        if (!loadedFolders.has(parent)) continue;

        const subData = selectCachedListFiles(state, { depth: LAZY_FILE_TREE_FETCH_DEPTH, path: p });

        if (!subData) continue;

        const subFiles = subData.files as FileItem[];
        const existingPaths = new Set(allFiles.map((f) => f.path));

        for (const file of subFiles) {
          if (!existingPaths.has(file.path)) {
            allFiles.push(file);
          }
        }

        loadedFolders.add(p);

        const subDirs = subFiles.filter(
          (f) => f.type === FILE_TYPE.DIRECTORY && getPathDepth(f.path) <= getPathDepth(p) + LAZY_FILE_TREE_FETCH_DEPTH,
        );

        for (const dir of subDirs) {
          loadedFolders.add(dir.path);
        }
      }
    }
  }

  return { files: allFiles, loadedFolders, hasCachedData: true };
}
