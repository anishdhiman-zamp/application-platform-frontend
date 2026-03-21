import { useCallback } from 'react';
import { useSelector, useStore } from 'react-redux';
import {
  FILESYSTEM_ENDPOINT_NAMES,
  FilesystemApi,
  useCopyFileMutation,
  useCreateItemMutation,
  useDeleteFileMutation,
  useMoveFileMutation,
} from '@/apis/filesystem';
import { APITags } from '@/constants/api.constants';
import { FILE_TYPE, type FileItem, type SourceItemInfo } from '@/modules/pace/components/files/file-tree.types';
import { buildFullPath, generateDuplicateName, getParentPath } from '@/modules/pace/components/files/file-tree.utils';
import { useLazyFileTreeContext } from '@/modules/pace/context/LazyFileTreeContext';
import type { AppDispatch, RootState } from '@/store';
import type { FileInfo, ListFilesRequest } from '@/types/api/filesystem.types';

function patchListFilesCache(
  dispatch: AppDispatch,
  getState: () => RootState,
  updater: (files: FileInfo[]) => FileInfo[],
) {
  const entries = FilesystemApi.util.selectInvalidatedBy(getState(), [{ type: APITags.GET_FILES_LIST }]);

  for (const { endpointName, originalArgs } of entries) {
    if (endpointName !== FILESYSTEM_ENDPOINT_NAMES.LIST_FILES) continue;

    dispatch(
      FilesystemApi.util.updateQueryData('listFiles', originalArgs as ListFilesRequest, (draft) => {
        draft.files = updater(draft.files as FileInfo[]);
      }),
    );
  }
}

interface UseFileActionsReturn {
  createFile: (name: string, parentPath: string) => Promise<void>;
  createFolder: (name: string, parentPath: string) => Promise<void>;
  deleteItem: (path: string) => Promise<void>;
  renameItem: (oldPath: string, newName: string, sourceItem?: SourceItemInfo) => Promise<void>;
  moveItem: (sourcePath: string, destinationPath: string, sourceItem?: SourceItemInfo) => Promise<void>;
  copyItem: (sourcePath: string, destinationPath: string, sourceItem?: SourceItemInfo) => Promise<void>;
  duplicateItem: (path: string, sourceItem?: SourceItemInfo, siblingNames?: string[]) => Promise<void>;
  isCreating: boolean;
  isDeleting: boolean;
  isRenaming: boolean;
  isMoving: boolean;
  isCopying: boolean;
}

export const useFileActions = (): UseFileActionsReturn => {
  const [createItem, { isLoading: isCreating }] = useCreateItemMutation();
  const [deleteFile, { isLoading: isDeleting }] = useDeleteFileMutation();
  const [moveFile, { isLoading: isMoveLoading }] = useMoveFileMutation();
  const [copyFile, { isLoading: isCopying }] = useCopyFileMutation();
  const username = useSelector((state: RootState) => state.user.user?.username);
  const store = useStore<RootState>();
  const lazyTree = useLazyFileTreeContext();

  const createFileAction = useCallback(
    async (name: string, parentPath: string) => {
      const fullPath = buildFullPath(parentPath, name);
      const optimisticItem: FileItem = {
        path: fullPath,
        name,
        type: FILE_TYPE.FILE,
        size: 0,
        mtime_ms: Date.now(),
        owner: username ?? '',
      };

      lazyTree?.addOptimistic(optimisticItem);

      try {
        await createItem({ path: fullPath, type: 'file', owner: username }).unwrap();
        lazyTree?.loadFolder(parentPath, { silent: true }).then((success) => {
          if (success) lazyTree?.confirmAddition(fullPath);
        });
      } catch (error) {
        lazyTree?.confirmAddition(fullPath);
        throw error;
      }
    },
    [createItem, username, lazyTree],
  );

  const createFolderAction = useCallback(
    async (name: string, parentPath: string) => {
      const fullPath = buildFullPath(parentPath, name);
      const optimisticItem: FileItem = {
        path: fullPath,
        name,
        type: FILE_TYPE.DIRECTORY,
        size: 0,
        mtime_ms: Date.now(),
        owner: username ?? '',
      };

      lazyTree?.addOptimistic(optimisticItem);

      try {
        await createItem({ path: fullPath, type: 'directory', owner: username }).unwrap();
        lazyTree?.loadFolder(parentPath, { silent: true }).then((success) => {
          if (success) lazyTree?.confirmAddition(fullPath);
        });
      } catch (error) {
        lazyTree?.confirmAddition(fullPath);
        throw error;
      }
    },
    [createItem, username, lazyTree],
  );

  const deleteItemAction = useCallback(
    async (path: string) => {
      lazyTree?.removeOptimistic(path);

      patchListFilesCache(store.dispatch as AppDispatch, store.getState, (files) =>
        files.filter((f) => f.path !== path && !f.path.startsWith(path + '/')),
      );

      try {
        await deleteFile({ path }).unwrap();
        const parentPath = getParentPath(path);

        lazyTree?.loadFolder(parentPath, { silent: true }).then((success) => {
          if (success) lazyTree?.confirmDeletion(path);
        });
      } catch (error) {
        lazyTree?.confirmDeletion(path);
        throw error;
      }
    },
    [deleteFile, lazyTree, store],
  );

  const renameItemAction = useCallback(
    async (oldPath: string, newName: string, sourceItem?: SourceItemInfo) => {
      const parentPath = getParentPath(oldPath);
      const destination = buildFullPath(parentPath, newName);

      lazyTree?.removeOptimistic(oldPath);

      if (sourceItem) {
        lazyTree?.addOptimistic({
          path: destination,
          name: newName,
          type: sourceItem.type,
          size: sourceItem.size,
          mtime_ms: Date.now(),
          owner: sourceItem.owner,
        });
      }

      patchListFilesCache(store.dispatch as AppDispatch, store.getState, (files) =>
        files.map((f) => {
          if (f.path === oldPath) {
            return { ...f, path: destination, name: newName, mtime_ms: Date.now() };
          }

          if (f.path.startsWith(oldPath + '/')) {
            return { ...f, path: destination + f.path.slice(oldPath.length) };
          }

          return f;
        }),
      );

      try {
        await moveFile({ source: oldPath, destination }).unwrap();
        lazyTree?.loadFolder(parentPath, { silent: true }).then((success) => {
          if (success) {
            lazyTree?.confirmDeletion(oldPath);
            if (sourceItem) lazyTree?.confirmAddition(destination);
          }
        });
      } catch (error) {
        lazyTree?.confirmDeletion(oldPath);
        if (sourceItem) lazyTree?.confirmAddition(destination);
        throw error;
      }
    },
    [moveFile, lazyTree, store],
  );

  const moveItemAction = useCallback(
    async (sourcePath: string, destinationPath: string, sourceItem?: SourceItemInfo) => {
      const sourceParent = getParentPath(sourcePath);
      const destParent = getParentPath(destinationPath);
      const destName = destinationPath.split('/').pop() || '';

      lazyTree?.removeOptimistic(sourcePath);

      if (sourceItem) {
        lazyTree?.addOptimistic({
          path: destinationPath,
          name: destName,
          type: sourceItem.type,
          size: sourceItem.size,
          mtime_ms: Date.now(),
          owner: sourceItem.owner,
        });
      }

      try {
        await moveFile({ source: sourcePath, destination: destinationPath }).unwrap();
        Promise.all([
          lazyTree?.loadFolder(sourceParent, { silent: true }),
          lazyTree?.loadFolder(destParent, { silent: true }),
        ]).then(([sourceOk, destOk]) => {
          if (sourceOk && destOk) {
            lazyTree?.confirmDeletion(sourcePath);
            if (sourceItem) lazyTree?.confirmAddition(destinationPath);
          }
        });
      } catch (error) {
        lazyTree?.confirmDeletion(sourcePath);
        if (sourceItem) lazyTree?.confirmAddition(destinationPath);
        throw error;
      }
    },
    [moveFile, lazyTree],
  );

  const copyItemAction = useCallback(
    async (sourcePath: string, destinationPath: string, sourceItem?: SourceItemInfo) => {
      const destParent = getParentPath(destinationPath);
      const destName = destinationPath.split('/').pop() || '';

      if (sourceItem) {
        lazyTree?.addOptimistic({
          path: destinationPath,
          name: destName,
          type: sourceItem.type,
          size: sourceItem.size,
          mtime_ms: Date.now(),
          owner: sourceItem.owner,
        });
      }

      try {
        await copyFile({ source: sourcePath, destination: destinationPath }).unwrap();
        lazyTree?.loadFolder(destParent, { silent: true }).then((success) => {
          if (success && sourceItem) lazyTree?.confirmAddition(destinationPath);
        });
      } catch (error) {
        if (sourceItem) lazyTree?.confirmAddition(destinationPath);
        throw error;
      }
    },
    [copyFile, lazyTree],
  );

  const duplicateItemAction = useCallback(
    async (path: string, sourceItem?: SourceItemInfo, siblingNames?: string[]) => {
      const parentPath = getParentPath(path);
      const name = path.split('/').pop() || path;
      const duplicateName = generateDuplicateName(name, siblingNames);
      const destination = buildFullPath(parentPath, duplicateName);

      if (sourceItem) {
        lazyTree?.addOptimistic({
          path: destination,
          name: duplicateName,
          type: sourceItem.type,
          size: sourceItem.size,
          mtime_ms: Date.now(),
          owner: sourceItem.owner,
        });
      }

      try {
        await copyFile({ source: path, destination }).unwrap();
        lazyTree?.loadFolder(parentPath, { silent: true }).then((success) => {
          if (success && sourceItem) lazyTree?.confirmAddition(destination);
        });
      } catch (error) {
        if (sourceItem) lazyTree?.confirmAddition(destination);
        throw error;
      }
    },
    [copyFile, lazyTree],
  );

  return {
    createFile: createFileAction,
    createFolder: createFolderAction,
    deleteItem: deleteItemAction,
    renameItem: renameItemAction,
    moveItem: moveItemAction,
    copyItem: copyItemAction,
    duplicateItem: duplicateItemAction,
    isCreating,
    isDeleting,
    isRenaming: isMoveLoading,
    isMoving: isMoveLoading,
    isCopying,
  };
};
