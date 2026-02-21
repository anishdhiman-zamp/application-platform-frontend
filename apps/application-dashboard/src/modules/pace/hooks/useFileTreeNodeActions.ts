import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useFileActions } from 'modules/pace/hooks/useFileActions';
import { useFileClipboard } from 'modules/pace/hooks/useFileClipboard';
import {
  CLIPBOARD_OPERATION,
  CONFLICT_RESOLUTION,
  type ConflictResolution,
  CREATE_ITEM_TYPE,
  type CreateItemType,
  FILE_TYPE,
  type FileConflict,
  type FileItem,
  type TreeNode,
} from '@/modules/pace/components/files/file-tree.types';
import { buildFullPath, generateKeepBothName } from '@/modules/pace/components/files/file-tree.utils';
import { useProtectedFolders } from '@/modules/pace/hooks/useProtectedFolders';

interface UseFileTreeNodeActionsProps {
  node: TreeNode;
  isExpanded: boolean;
  childrenNames: string[];
  isProtected?: boolean;
  onToggleExpand: (path: string) => void;
  onStartRename: () => void;
  onOpenCreateModal: (type: CreateItemType) => void;
  onConflict: (conflict: FileConflict) => void;
  onCloseContextMenu: () => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
  onFileDeleted?: (deletedPath: string) => void;
  onFileCreated?: (newFile: FileItem) => void;
}

interface UseFileTreeNodeActionsReturn {
  isCutItem: boolean;
  handleActionClick: (actionId: string) => Promise<void>;
  handleCreate: (name: string, parentPath: string, createModalType: CreateItemType | null) => Promise<void>;
  handleConflictResolve: (resolution: ConflictResolution, fileConflict: FileConflict | null) => Promise<void>;
}

export const useFileTreeNodeActions = ({
  node,
  isExpanded,
  childrenNames,
  isProtected = false,
  onToggleExpand,
  onStartRename,
  onOpenCreateModal,
  onConflict,
  onCloseContextMenu,
  onFileMoved,
  onFileDeleted,
  onFileCreated,
}: UseFileTreeNodeActionsProps): UseFileTreeNodeActionsReturn => {
  const { createFile, createFolder, deleteItem, duplicateItem, copyItem, moveItem } = useFileActions();
  const { clipboard, setCopyClipboard, setCutClipboard, clearClipboard } = useFileClipboard();
  const { username } = useProtectedFolders();

  const isCutItem = clipboard?.operation === CLIPBOARD_OPERATION.CUT && clipboard.path === node.path;

  const handleActionClick = async (actionId: string) => {
    onCloseContextMenu();

    try {
      switch (actionId) {
        case 'create-file':
          onOpenCreateModal(CREATE_ITEM_TYPE.FILE);
          break;
        case 'create-folder':
          onOpenCreateModal(CREATE_ITEM_TYPE.FOLDER);
          break;
        case 'rename':
          if (isProtected) {
            toast.error('Cannot rename protected folders');
            break;
          }
          onStartRename();
          break;
        case 'delete':
          if (isProtected) {
            toast.error('Cannot delete protected folders');
            break;
          }
          await deleteItem(node.path);
          onFileDeleted?.(node.path);
          break;
        case 'duplicate':
          await duplicateItem(node.path);
          break;
        case 'copy':
          setCopyClipboard(node.path, node.name, node.type, node.size, node.owner);
          break;
        case 'cut':
          if (isProtected) {
            toast.error('Cannot cut protected folders');
            break;
          }
          setCutClipboard(node.path, node.name, node.type, node.size, node.owner);
          break;
        case 'paste':
          if (clipboard) {
            const destinationPath = `${node.path}/${clipboard.name}`;

            if (clipboard.operation === CLIPBOARD_OPERATION.CUT && clipboard.path === destinationPath) {
              break;
            }

            const isInvalidTarget = node.path === clipboard.path || node.path.startsWith(`${clipboard.path}/`);

            if (isInvalidTarget) {
              toast.error('Cannot paste a folder into itself');
              break;
            }

            const hasConflict = childrenNames.includes(clipboard.name);

            if (hasConflict) {
              onConflict({
                sourcePath: clipboard.path,
                sourceName: clipboard.name,
                sourceType: clipboard.type,
                sourceSize: clipboard.size,
                sourceOwner: clipboard.owner,
                destinationPath,
                operation: clipboard.operation,
              });
              break;
            }

            if (!isExpanded) {
              onToggleExpand(node.path);
            }

            if (clipboard.operation === CLIPBOARD_OPERATION.COPY) {
              await copyItem(clipboard.path, destinationPath);
            } else {
              await moveItem(clipboard.path, destinationPath);
              clearClipboard();

              const newFile: FileItem = {
                path: destinationPath,
                name: clipboard.name,
                type: clipboard.type,
                size: clipboard.size,
                mtime_ms: Date.now(),
                owner: clipboard.owner,
              };

              onFileMoved?.(clipboard.path, newFile);
            }
          }
          break;
        default:
          break;
      }
    } catch (error) {
      captureException(error);
      toast.error(`Failed to ${actionId.replace('-', ' ')}`);
    }
  };

  const handleCreate = async (name: string, parentPath: string, createModalType: CreateItemType | null) => {
    if (!isExpanded) {
      onToggleExpand(node.path);
    }

    try {
      if (createModalType === CREATE_ITEM_TYPE.FILE) {
        await createFile(name, parentPath);
      } else {
        await createFolder(name, parentPath);
      }

      const fullPath = buildFullPath(parentPath, name);
      const newFile: FileItem = {
        path: fullPath,
        name,
        type: createModalType === CREATE_ITEM_TYPE.FILE ? FILE_TYPE.FILE : FILE_TYPE.DIRECTORY,
        size: 0,
        mtime_ms: Date.now(),
        owner: username,
      };

      onFileCreated?.(newFile);
    } catch (error) {
      captureException(error);
      toast.error('Failed to create item');
    }
  };

  const handleConflictResolve = async (resolution: ConflictResolution, fileConflict: FileConflict | null) => {
    if (!fileConflict) return;

    const { sourcePath, sourceName, sourceType, sourceSize, sourceOwner, destinationPath, operation } = fileConflict;

    try {
      if (!isExpanded) {
        onToggleExpand(node.path);
      }

      if (resolution === CONFLICT_RESOLUTION.KEEP_BOTH) {
        const newName = generateKeepBothName(sourceName, childrenNames);
        const parentPath = destinationPath.slice(0, destinationPath.lastIndexOf('/'));
        const newDestinationPath = `${parentPath}/${newName}`;

        if (operation === CLIPBOARD_OPERATION.COPY) {
          await copyItem(sourcePath, newDestinationPath);
        } else {
          await moveItem(sourcePath, newDestinationPath);
          if (operation === CLIPBOARD_OPERATION.CUT) {
            clearClipboard();
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
        deleteItem(destinationPath);

        if (operation === CLIPBOARD_OPERATION.COPY) {
          await copyItem(sourcePath, destinationPath);
        } else {
          await moveItem(sourcePath, destinationPath);
          if (operation === CLIPBOARD_OPERATION.CUT) {
            clearClipboard();
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
    } catch (error) {
      captureException(error);
      toast.error('Failed to resolve conflict');
    }
  };

  return {
    isCutItem,
    handleActionClick,
    handleCreate,
    handleConflictResolve,
  };
};
