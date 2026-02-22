import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useFileActions } from 'modules/pace/hooks/useFileActions';
import { useFileClipboard } from 'modules/pace/hooks/useFileClipboard';
import {
  CLIPBOARD_OPERATION,
  CREATE_ITEM_TYPE,
  type CreateItemType,
  FILE_TYPE,
  type FileItem,
  type TreeNode,
} from '@/modules/pace/components/files/file-tree.types';
import {
  buildFullPath,
  executeMoveOrCopy,
  validatePasteOperation,
} from '@/modules/pace/components/files/file-tree.utils';
import { CONTEXT_MENU_ACTION_IDS, FILE_TOAST_MESSAGES } from '@/modules/pace/components/files/files.constants';
import { useFileConflict } from '@/modules/pace/hooks/useFileConflict';
import { useProtectedFolders } from '@/modules/pace/hooks/useProtectedFolders';

interface UseFileTreeNodeActionsProps {
  node: TreeNode;
  isExpanded: boolean;
  childrenNames: string[];
  isProtected?: boolean;
  onToggleExpand: (path: string) => void;
  onStartRename: () => void;
  onOpenCreateModal: (type: CreateItemType) => void;
  onCloseContextMenu: () => void;
  onFileMoved?: (oldPath: string, newFile: FileItem) => void;
  onFileDeleted?: (deletedPath: string) => void;
  onFileCreated?: (newFile: FileItem) => void;
}

interface UseFileTreeNodeActionsReturn {
  isCutItem: boolean;
  handleActionClick: (actionId: string) => Promise<void>;
  handleCreate: (name: string, parentPath: string, createModalType: CreateItemType | null) => Promise<void>;
}

export const useFileTreeNodeActions = ({
  node,
  isExpanded,
  childrenNames,
  isProtected = false,
  onToggleExpand,
  onStartRename,
  onOpenCreateModal,
  onCloseContextMenu,
  onFileMoved,
  onFileDeleted,
  onFileCreated,
}: UseFileTreeNodeActionsProps): UseFileTreeNodeActionsReturn => {
  const { createFile, createFolder, deleteItem, duplicateItem, copyItem, moveItem } = useFileActions();
  const { clipboard, setCopyClipboard, setCutClipboard, clearClipboard } = useFileClipboard();
  const { setConflict } = useFileConflict();
  const { username } = useProtectedFolders();

  const isCutItem = clipboard?.operation === CLIPBOARD_OPERATION.CUT && clipboard.path === node.path;

  const handleActionClick = async (actionId: string) => {
    onCloseContextMenu();

    try {
      switch (actionId) {
        case CONTEXT_MENU_ACTION_IDS.CREATE_FILE:
          onOpenCreateModal(CREATE_ITEM_TYPE.FILE);
          break;
        case CONTEXT_MENU_ACTION_IDS.CREATE_FOLDER:
          onOpenCreateModal(CREATE_ITEM_TYPE.FOLDER);
          break;
        case CONTEXT_MENU_ACTION_IDS.RENAME:
          if (isProtected) {
            toast.error(FILE_TOAST_MESSAGES.CANNOT_RENAME_PROTECTED);
            break;
          }
          onStartRename();
          break;
        case CONTEXT_MENU_ACTION_IDS.DELETE:
          if (isProtected) {
            toast.error(FILE_TOAST_MESSAGES.CANNOT_DELETE_PROTECTED);
            break;
          }
          await deleteItem(node.path);
          onFileDeleted?.(node.path);
          break;
        case CONTEXT_MENU_ACTION_IDS.DUPLICATE:
          await duplicateItem(node.path);
          break;
        case CONTEXT_MENU_ACTION_IDS.COPY:
          setCopyClipboard(node.path, node.name, node.type, node.size, node.owner);
          break;
        case CONTEXT_MENU_ACTION_IDS.CUT:
          if (isProtected) {
            toast.error(FILE_TOAST_MESSAGES.CANNOT_CUT_PROTECTED);
            break;
          }
          setCutClipboard(node.path, node.name, node.type, node.size, node.owner);
          break;
        case CONTEXT_MENU_ACTION_IDS.PASTE:
          if (clipboard) {
            const validation = validatePasteOperation(clipboard, node.path, childrenNames);

            if (!validation.valid) {
              if (validation.reason === 'invalid-target') {
                toast.error(FILE_TOAST_MESSAGES.CANNOT_PASTE_INTO_ITSELF);
              }
              break;
            }

            if (validation.hasConflict) {
              setConflict({
                sourcePath: clipboard.path,
                sourceName: clipboard.name,
                sourceType: clipboard.type,
                sourceSize: clipboard.size,
                sourceOwner: clipboard.owner,
                destinationPath: validation.destinationPath,
                operation: clipboard.operation,
              });
              break;
            }

            if (!isExpanded) {
              onToggleExpand(node.path);
            }

            const isCopy = clipboard.operation === CLIPBOARD_OPERATION.COPY;

            await executeMoveOrCopy({
              sourcePath: clipboard.path,
              sourceName: clipboard.name,
              sourceType: clipboard.type,
              sourceSize: clipboard.size,
              sourceOwner: clipboard.owner,
              destinationPath: validation.destinationPath,
              isCopy,
              actions: { copyItem, moveItem },
              onFileMoved: isCopy ? undefined : onFileMoved,
            });

            if (!isCopy) {
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
      toast.error(FILE_TOAST_MESSAGES.FAILED_TO_CREATE_ITEM);
    }
  };

  return {
    isCutItem,
    handleActionClick,
    handleCreate,
  };
};
