'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'react-redux';
import { FilesystemApi, useLazyListFilesQuery } from '@/apis/filesystem';
import { FILE_TYPE, type FileItem } from '@/modules/pace/components/files/file-tree.types';
import type { RootState } from '@/store';
import type { ListFilesRequest, ListFilesResponse } from '@/types/api/filesystem.types';
import { getStoredExpandedPaths } from '@/utils/localstorage';

const FETCH_DEPTH = 2;

interface UseLazyFileTreeOptions {
  uploadingItems?: FileItem[];
  searchQuery?: string;
}

interface UseLazyFileTreeReturn {
  files: FileItem[];
  searchResults: FileItem[] | null;
  isSearching: boolean;
  isInitialLoading: boolean;
  isError: boolean;
  loadingFolders: Set<string>;
  loadedFolders: Set<string>;
  loadFolder: (path: string, options?: { silent?: boolean }) => Promise<boolean>;
  refetch: () => void;
  addOptimistic: (items: FileItem | FileItem[]) => void;
  removeOptimistic: (path: string) => void;
  confirmAddition: (path: string) => void;
  confirmDeletion: (path: string) => void;
}

function getPathDepth(path: string): number {
  if (!path) return 0;

  return path.split('/').length;
}

function groupByDepth(paths: string[]): Map<number, string[]> {
  const map = new Map<number, string[]>();

  for (const p of paths) {
    const depth = getPathDepth(p);
    const existing = map.get(depth) ?? [];

    existing.push(p);
    map.set(depth, existing);
  }

  return new Map([...map.entries()].sort(([a], [b]) => a - b));
}

function isChildOf(childPath: string, parentPath: string): boolean {
  if (!parentPath) return !childPath.includes('/');

  return childPath.startsWith(parentPath + '/');
}

function getDirectParent(path: string): string {
  const idx = path.lastIndexOf('/');

  return idx === -1 ? '' : path.slice(0, idx);
}

function selectCachedListFiles(state: RootState, args: ListFilesRequest): ListFilesResponse | undefined {
  const result = FilesystemApi.endpoints.listFiles.select(args)(state);

  return result?.data;
}

function buildCacheSnapshot(state: RootState): {
  files: FileItem[];
  loadedFolders: Set<string>;
  hasCachedData: boolean;
} {
  const rootData = selectCachedListFiles(state, { depth: FETCH_DEPTH });

  if (!rootData) {
    return { files: [], loadedFolders: new Set(), hasCachedData: false };
  }

  const allFiles: FileItem[] = [...(rootData.files as FileItem[])];
  const loadedFolders = new Set<string>();

  loadedFolders.add('');

  const rootDirs = rootData.files.filter((f) => f.type === FILE_TYPE.DIRECTORY && getPathDepth(f.path) <= FETCH_DEPTH);

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

        const subData = selectCachedListFiles(state, { depth: FETCH_DEPTH, path: p });

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
          (f) => f.type === FILE_TYPE.DIRECTORY && getPathDepth(f.path) <= getPathDepth(p) + FETCH_DEPTH,
        );

        for (const dir of subDirs) {
          loadedFolders.add(dir.path);
        }
      }
    }
  }

  return { files: allFiles, loadedFolders, hasCachedData: true };
}

export const useLazyFileTree = ({
  uploadingItems = [],
  searchQuery = '',
}: UseLazyFileTreeOptions = {}): UseLazyFileTreeReturn => {
  const store = useStore<RootState>();

  const [cacheSnapshot] = useState(() => buildCacheSnapshot(store.getState()));

  const [serverFiles, setServerFiles] = useState<FileItem[]>(() => cacheSnapshot.files);
  const [loadedFolders, setLoadedFolders] = useState<Set<string>>(() => cacheSnapshot.loadedFolders);
  const [loadingFolders, setLoadingFolders] = useState<Set<string>>(new Set());
  const [optimisticAdditions, setOptimisticAdditions] = useState<Map<string, FileItem>>(new Map());
  const [optimisticDeletions, setOptimisticDeletions] = useState<Set<string>>(new Set());
  const [isInitialLoading, setIsInitialLoading] = useState(!cacheSnapshot.hasCachedData);
  const [isError, setIsError] = useState(false);
  const [searchResults, setSearchResults] = useState<FileItem[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [trigger] = useLazyListFilesQuery();
  const isRestoringRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const hasSeededFromCacheRef = useRef(cacheSnapshot.hasCachedData);
  const searchAbortRef = useRef(0);

  const markFolderLoading = useCallback((path: string, loading: boolean) => {
    setLoadingFolders((prev) => {
      const next = new Set(prev);

      if (loading) {
        next.add(path);
      } else {
        next.delete(path);
      }

      return next;
    });
  }, []);

  const mergeServerFiles = useCallback((fetchedPath: string, fetchedFiles: FileItem[]) => {
    setServerFiles((prev) => {
      const fetchedPathsSet = new Set(fetchedFiles.map((f) => f.path));
      const fetchedPathDepth = fetchedPath ? getPathDepth(fetchedPath) : 0;
      const coveredDepth = fetchedPathDepth + FETCH_DEPTH + 1;

      const filtered = prev.filter((existing) => {
        if (fetchedPathsSet.has(existing.path)) return false;

        if (fetchedPath === '') {
          return getPathDepth(existing.path) > coveredDepth;
        }

        if (!isChildOf(existing.path, fetchedPath)) return true;

        return getPathDepth(existing.path) > coveredDepth;
      });

      return [...filtered, ...fetchedFiles];
    });
  }, []);

  const markLoadedFolders = useCallback((fetchedPath: string, fetchedFiles: FileItem[]) => {
    setLoadedFolders((prev) => {
      const next = new Set(prev);

      next.add(fetchedPath);

      const fetchedPathDepth = fetchedPath ? getPathDepth(fetchedPath) : 0;
      const maxLoadedDepth = fetchedPathDepth + FETCH_DEPTH;

      const directories = fetchedFiles.filter((f) => f.type === FILE_TYPE.DIRECTORY);

      for (const dir of directories) {
        if (getPathDepth(dir.path) <= maxLoadedDepth) {
          next.add(dir.path);
        }
      }

      return next;
    });
  }, []);

  const loadFolder = useCallback(
    async (path: string, { silent = false }: { silent?: boolean } = {}): Promise<boolean> => {
      if (loadingFolders.has(path)) return false;

      if (!silent) {
        markFolderLoading(path, true);
      }

      try {
        const result = await trigger({
          depth: FETCH_DEPTH,
          path: path || undefined,
        }).unwrap();

        mergeServerFiles(path, result.files);
        markLoadedFolders(path, result.files);
        setIsError(false);

        return true;
      } catch {
        setIsError(true);

        return false;
      } finally {
        if (!silent) {
          markFolderLoading(path, false);
        }
      }
    },
    [trigger, mergeServerFiles, markLoadedFolders, markFolderLoading, loadingFolders],
  );

  const restoreExpandedFolders = useCallback(
    async (rootFiles: FileItem[], { silent = false }: { silent?: boolean } = {}) => {
      const storedPaths = getStoredExpandedPaths();

      if (storedPaths.length === 0) return;

      const byDepth = groupByDepth(storedPaths);
      const currentLoaded = new Set<string>();

      currentLoaded.add('');
      const rootLoadedDirs = rootFiles.filter(
        (f) => f.type === FILE_TYPE.DIRECTORY && getPathDepth(f.path) <= FETCH_DEPTH,
      );

      for (const folder of rootLoadedDirs) {
        currentLoaded.add(folder.path);
      }

      for (const [, paths] of byDepth) {
        const needsFetch = paths.filter((p) => {
          if (currentLoaded.has(p)) return false;

          const parent = getDirectParent(p);

          return currentLoaded.has(parent);
        });

        if (needsFetch.length === 0) continue;

        const results = await Promise.all(
          needsFetch.map(async (p) => {
            if (!silent) {
              markFolderLoading(p, true);
            }

            try {
              const res = await trigger({ depth: FETCH_DEPTH, path: p }).unwrap();

              return { path: p, files: res.files };
            } finally {
              if (!silent) {
                markFolderLoading(p, false);
              }
            }
          }),
        );

        for (const { path: fetchedPath, files: fetchedFiles } of results) {
          mergeServerFiles(fetchedPath, fetchedFiles);
          markLoadedFolders(fetchedPath, fetchedFiles);

          currentLoaded.add(fetchedPath);
          const fetchedDepth = getPathDepth(fetchedPath);
          const loadedDirs = fetchedFiles.filter(
            (f) => f.type === FILE_TYPE.DIRECTORY && getPathDepth(f.path) <= fetchedDepth + FETCH_DEPTH,
          );

          for (const folder of loadedDirs) {
            currentLoaded.add(folder.path);
          }
        }
      }
    },
    [trigger, mergeServerFiles, markLoadedFolders, markFolderLoading],
  );

  const restoreExpandedState = useCallback(
    async ({ skipRootLoader = false }: { skipRootLoader?: boolean } = {}) => {
      if (isRestoringRef.current) return;

      isRestoringRef.current = true;

      if (!skipRootLoader) {
        setIsInitialLoading(true);
      }

      try {
        const rootResult = await trigger({ depth: FETCH_DEPTH }).unwrap();

        mergeServerFiles('', rootResult.files);
        markLoadedFolders('', rootResult.files);
        setIsError(false);
        setIsInitialLoading(false);

        restoreExpandedFolders(rootResult.files, { silent: skipRootLoader });
      } catch {
        if (!skipRootLoader) {
          setIsError(true);
        }

        setIsInitialLoading(false);
      } finally {
        isRestoringRef.current = false;
      }
    },
    [trigger, mergeServerFiles, markLoadedFolders, restoreExpandedFolders],
  );

  useEffect(() => {
    if (hasInitializedRef.current) return;

    hasInitializedRef.current = true;

    if (hasSeededFromCacheRef.current) {
      restoreExpandedState({ skipRootLoader: true });
    } else {
      restoreExpandedState({ skipRootLoader: false });
    }
  }, [restoreExpandedState]);

  const addOptimistic = useCallback((items: FileItem | FileItem[]) => {
    const itemArray = Array.isArray(items) ? items : [items];

    setOptimisticAdditions((prev) => {
      const next = new Map(prev);

      for (const item of itemArray) {
        next.set(item.path, item);
      }

      return next;
    });
  }, []);

  const removeOptimistic = useCallback((path: string) => {
    setOptimisticDeletions((prev) => {
      const next = new Set(prev);

      next.add(path);

      return next;
    });
  }, []);

  const confirmAddition = useCallback((path: string) => {
    setOptimisticAdditions((prev) => {
      const next = new Map(prev);

      next.delete(path);

      return next;
    });
  }, []);

  const confirmDeletion = useCallback((path: string) => {
    setOptimisticDeletions((prev) => {
      const next = new Set(prev);

      next.delete(path);

      return next;
    });
  }, []);

  const refetch = useCallback(() => {
    setServerFiles([]);
    setLoadedFolders(new Set());
    setOptimisticAdditions(new Map());
    setOptimisticDeletions(new Set());
    hasInitializedRef.current = false;
    isRestoringRef.current = false;
    hasSeededFromCacheRef.current = false;
    restoreExpandedState();
  }, [restoreExpandedState]);

  // Derived State
  const files = useMemo(() => {
    const deletedPaths = Array.from(optimisticDeletions);

    let result = serverFiles.filter((f) => {
      if (optimisticDeletions.has(f.path)) return false;

      return !deletedPaths.some((dp) => f.path.startsWith(dp + '/'));
    });

    const serverPaths = new Set(result.map((f) => f.path));

    for (const [path, item] of optimisticAdditions) {
      if (!serverPaths.has(path)) {
        result.push(item);
      }
    }

    if (uploadingItems.length > 0) {
      const existingPaths = new Set(result.map((f) => f.path));
      const newUploadItems = uploadingItems.filter((item) => !existingPaths.has(item.path));

      if (newUploadItems.length > 0) {
        result = [...result, ...newUploadItems];
      }
    }

    return result;
  }, [serverFiles, optimisticAdditions, optimisticDeletions, uploadingItems]);

  // Effects
  useEffect(() => {
    const requestId = ++searchAbortRef.current;

    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);

      return;
    }

    setIsSearching(true);

    trigger({ depth: -1, query: searchQuery.trim() })
      .unwrap()
      .then((result) => {
        if (searchAbortRef.current === requestId) {
          setSearchResults(result.files as FileItem[]);
          setIsSearching(false);
        }
      })
      .catch(() => {
        if (searchAbortRef.current === requestId) {
          setSearchResults([]);
          setIsSearching(false);
        }
      });
  }, [searchQuery, trigger]);

  return {
    files,
    searchResults,
    isSearching,
    isInitialLoading,
    isError,
    loadingFolders,
    loadedFolders,
    loadFolder,
    refetch,
    addOptimistic,
    removeOptimistic,
    confirmAddition,
    confirmDeletion,
  };
};
