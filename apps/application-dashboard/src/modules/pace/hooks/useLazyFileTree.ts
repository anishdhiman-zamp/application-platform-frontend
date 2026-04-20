'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from 'react-redux';
import { useLazyListFilesQuery } from '@/apis/filesystem';
import { FILE_TYPE, type FileItem } from '@/modules/pace/components/files/file-tree.types';
import {
  buildCacheSnapshot,
  getDirectParent,
  getPathDepth,
  groupByDepth,
  isChildOf,
  LAZY_FILE_TREE_FETCH_DEPTH,
} from '@/modules/pace/hooks/lazy-file-tree.utils';
import type { RootState } from '@/store';
import { getStoredExpandedPaths } from '@/utils/localstorage';

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
  pruneServerFiles: (path: string) => void;
  renameServerFiles: (oldPath: string, newPath: string) => void;
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
  const loadingFoldersRef = useRef(loadingFolders);
  const serverFilesRef = useRef(serverFiles);

  loadingFoldersRef.current = loadingFolders;
  serverFilesRef.current = serverFiles;

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
      const coveredDepth = fetchedPathDepth + LAZY_FILE_TREE_FETCH_DEPTH + (fetchedPath ? 0 : 1);

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

  const pruneServerFiles = useCallback((path: string) => {
    setServerFiles((prevFiles) => prevFiles.filter((file) => file.path !== path && !file.path.startsWith(path + '/')));
    setLoadedFolders((prevLoaded) => {
      const nextLoaded = new Set<string>();
      let changed = false;

      for (const loadedPath of prevLoaded) {
        if (loadedPath === path || loadedPath.startsWith(path + '/')) {
          changed = true;
        } else {
          nextLoaded.add(loadedPath);
        }
      }

      return changed ? nextLoaded : prevLoaded;
    });
  }, []);

  const renameServerFiles = useCallback((oldPath: string, newPath: string) => {
    setServerFiles((prevFiles) =>
      prevFiles.map((file) => {
        if (file.path === oldPath) {
          const segments = newPath.split('/');

          return { ...file, path: newPath, name: segments[segments.length - 1] ?? file.name };
        }

        if (file.path.startsWith(oldPath + '/')) {
          return { ...file, path: newPath + file.path.slice(oldPath.length) };
        }

        return file;
      }),
    );

    setLoadedFolders((prevLoaded) => {
      const nextLoaded = new Set<string>();
      let changed = false;

      for (const loadedPath of prevLoaded) {
        if (loadedPath === oldPath) {
          nextLoaded.add(newPath);
          changed = true;
        } else if (loadedPath.startsWith(oldPath + '/')) {
          nextLoaded.add(newPath + loadedPath.slice(oldPath.length));
          changed = true;
        } else {
          nextLoaded.add(loadedPath);
        }
      }

      return changed ? nextLoaded : prevLoaded;
    });
  }, []);

  const markLoadedFolders = useCallback((fetchedPath: string, fetchedFiles: FileItem[]) => {
    setLoadedFolders((prev) => {
      const next = new Set(prev);

      next.add(fetchedPath);

      const fetchedPathDepth = fetchedPath ? getPathDepth(fetchedPath) : 0;
      const maxLoadedDepth = fetchedPathDepth + LAZY_FILE_TREE_FETCH_DEPTH;

      const directories = fetchedFiles.filter((f) => f.type === FILE_TYPE.DIRECTORY);

      for (const dir of directories) {
        const dirDepth = getPathDepth(dir.path);

        if (fetchedPath ? dirDepth < maxLoadedDepth : dirDepth <= maxLoadedDepth) {
          next.add(dir.path);
        }
      }

      return next;
    });
  }, []);

  const loadFolder = useCallback(
    async (path: string, { silent = false }: { silent?: boolean } = {}): Promise<boolean> => {
      const normalizedPath = path === '/' ? '' : path;

      if (loadingFoldersRef.current.has(normalizedPath)) return false;

      if (!silent) {
        markFolderLoading(normalizedPath, true);
      }

      try {
        const result = await trigger({
          depth: LAZY_FILE_TREE_FETCH_DEPTH,
          path: normalizedPath || undefined,
        }).unwrap();

        mergeServerFiles(normalizedPath, result.files);
        markLoadedFolders(normalizedPath, result.files);
        setIsError(false);

        return true;
      } catch {
        setIsError(true);

        return false;
      } finally {
        if (!silent) {
          markFolderLoading(normalizedPath, false);
        }
      }
    },
    [trigger, mergeServerFiles, markLoadedFolders, markFolderLoading],
  );

  const restoreExpandedFolders = useCallback(
    async (rootFiles: FileItem[]) => {
      const storedPaths = getStoredExpandedPaths();

      if (storedPaths.length === 0) return;

      const byDepth = groupByDepth(storedPaths);
      const currentLoaded = new Set<string>();

      currentLoaded.add('');
      const rootLoadedDirs = rootFiles.filter(
        (f) => f.type === FILE_TYPE.DIRECTORY && getPathDepth(f.path) <= LAZY_FILE_TREE_FETCH_DEPTH,
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
            markFolderLoading(p, true);

            try {
              const res = await trigger({ depth: LAZY_FILE_TREE_FETCH_DEPTH, path: p }).unwrap();

              return { path: p, files: res.files };
            } finally {
              markFolderLoading(p, false);
            }
          }),
        );

        for (const { path: fetchedPath, files: fetchedFiles } of results) {
          mergeServerFiles(fetchedPath, fetchedFiles);
          markLoadedFolders(fetchedPath, fetchedFiles);

          currentLoaded.add(fetchedPath);
          const fetchedDepth = getPathDepth(fetchedPath);
          const loadedDirs = fetchedFiles.filter(
            (f) => f.type === FILE_TYPE.DIRECTORY && getPathDepth(f.path) < fetchedDepth + LAZY_FILE_TREE_FETCH_DEPTH,
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
        const rootPromise = trigger({ depth: LAZY_FILE_TREE_FETCH_DEPTH }).unwrap();

        if (skipRootLoader) {
          const storedPaths = getStoredExpandedPaths();

          const rootCoveredLoaded = new Set<string>(['']);
          const cachedDirs = cacheSnapshot.files.filter(
            (f) => f.type === FILE_TYPE.DIRECTORY && getPathDepth(f.path) <= LAZY_FILE_TREE_FETCH_DEPTH,
          );

          for (const dir of cachedDirs) {
            rootCoveredLoaded.add(dir.path);
          }

          const byDepth = groupByDepth(storedPaths);
          const planLoaded = new Set(rootCoveredLoaded);
          const pathsToPreFetch: string[] = [];

          for (const [, paths] of byDepth) {
            const needed = paths.filter((p) => !planLoaded.has(p) && planLoaded.has(getDirectParent(p)));

            pathsToPreFetch.push(...needed);

            for (const p of needed) {
              planLoaded.add(p);

              const pDepth = getPathDepth(p);
              const coveredDirs = cacheSnapshot.files.filter(
                (f) =>
                  f.type === FILE_TYPE.DIRECTORY &&
                  isChildOf(f.path, p) &&
                  getPathDepth(f.path) < pDepth + LAZY_FILE_TREE_FETCH_DEPTH,
              );

              for (const dir of coveredDirs) {
                planLoaded.add(dir.path);
              }
            }
          }

          const currentFiles = serverFilesRef.current;

          const sequentialFetch = async () => {
            for (const p of pathsToPreFetch) {
              const hasCachedChildren = currentFiles.some((f) => isChildOf(f.path, p));

              if (!hasCachedChildren) {
                markFolderLoading(p, true);
              }

              try {
                const res = await trigger({ depth: LAZY_FILE_TREE_FETCH_DEPTH, path: p }).unwrap();

                mergeServerFiles(p, res.files);
                markLoadedFolders(p, res.files);
              } catch {
                // skip failed folder
              } finally {
                if (!hasCachedChildren) {
                  markFolderLoading(p, false);
                }
              }
            }
          };

          const [rootResult] = await Promise.all([rootPromise, sequentialFetch()]);

          mergeServerFiles('', rootResult.files);
          markLoadedFolders('', rootResult.files);
          setIsError(false);
          setIsInitialLoading(false);
        } else {
          const rootResult = await rootPromise;

          mergeServerFiles('', rootResult.files);
          markLoadedFolders('', rootResult.files);
          setIsError(false);
          setIsInitialLoading(false);

          restoreExpandedFolders(rootResult.files);
        }
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
    pruneServerFiles,
    renameServerFiles,
  };
};
