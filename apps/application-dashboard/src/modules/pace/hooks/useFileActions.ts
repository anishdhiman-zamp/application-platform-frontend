import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  useCopyFileMutation,
  useCreateItemMutation,
  useDeleteFileMutation,
  useMoveFileMutation,
} from '@/apis/filesystem';
import { buildFullPath, generateDuplicateName, getParentPath } from '@/modules/pace/components/files/file-tree.utils';
import { RootState } from '@/store';

interface UseFileActionsReturn {
  createFile: (name: string, parentPath: string) => Promise<void>;
  createFolder: (name: string, parentPath: string) => Promise<void>;
  deleteItem: (path: string) => Promise<void>;
  renameItem: (oldPath: string, newName: string) => Promise<void>;
  moveItem: (sourcePath: string, destinationPath: string) => Promise<void>;
  copyItem: (sourcePath: string, destinationPath: string) => Promise<void>;
  duplicateItem: (path: string) => Promise<void>;
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

  const createFileAction = useCallback(
    async (name: string, parentPath: string) => {
      const fullPath = buildFullPath(parentPath, name);

      await createItem({ path: fullPath, type: 'file', owner: username }).unwrap();
    },
    [createItem, username],
  );

  const createFolderAction = useCallback(
    async (name: string, parentPath: string) => {
      const fullPath = buildFullPath(parentPath, name);

      await createItem({ path: fullPath, type: 'directory', owner: username }).unwrap();
    },
    [createItem, username],
  );

  const deleteItemAction = useCallback(
    async (path: string) => {
      await deleteFile({ path }).unwrap();
    },
    [deleteFile],
  );

  const renameItemAction = useCallback(
    async (oldPath: string, newName: string) => {
      const parentPath = getParentPath(oldPath);
      const destination = buildFullPath(parentPath, newName);

      await moveFile({ source: oldPath, destination }).unwrap();
    },
    [moveFile],
  );

  const moveItemAction = useCallback(
    async (sourcePath: string, destinationPath: string) => {
      await moveFile({ source: sourcePath, destination: destinationPath }).unwrap();
    },
    [moveFile],
  );

  const copyItemAction = useCallback(
    async (sourcePath: string, destinationPath: string) => {
      await copyFile({ source: sourcePath, destination: destinationPath }).unwrap();
    },
    [copyFile],
  );

  const duplicateItemAction = useCallback(
    async (path: string) => {
      const parentPath = getParentPath(path);
      const name = path.split('/').pop() || path;
      const duplicateName = generateDuplicateName(name);
      const destination = buildFullPath(parentPath, duplicateName);

      await copyFile({ source: path, destination }).unwrap();
    },
    [copyFile],
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
