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
  type FileConflict,
  type TreeNode,
} from '@/modules/pace/components/files/file-tree.types';
import { generateKeepBothName } from '@/modules/pace/components/files/file-tree.utils';

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
}: UseFileTreeNodeActionsProps): UseFileTreeNodeActionsReturn => {
  const { createFile, createFolder, deleteItem, duplicateItem, copyItem, moveItem } = useFileActions();
  const { clipboard, setCopyClipboard, setCutClipboard, clearClipboard } = useFileClipboard();

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
          break;
        case 'duplicate':
          await duplicateItem(node.path);
          break;
        case 'copy':
          setCopyClipboard(node.path, node.name, node.type);
          break;
        case 'cut':
          if (isProtected) {
            toast.error('Cannot cut protected folders');
            break;
          }
          setCutClipboard(node.path, node.name, node.type);
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
    } catch (error) {
      captureException(error);
      toast.error('Failed to create item');
    }
  };

  const handleConflictResolve = async (resolution: ConflictResolution, fileConflict: FileConflict | null) => {
    if (!fileConflict) return;

    const { sourcePath, sourceName, destinationPath, operation } = fileConflict;

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
