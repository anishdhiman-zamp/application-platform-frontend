import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
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
import { useFileTreeContext } from '@/modules/pace/hooks/useFileTreeContext';

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
  onTriggerFileUpload?: () => void;
  onTriggerFolderUpload?: () => void;
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
  onTriggerFileUpload,
  onTriggerFolderUpload,
}: UseFileTreeNodeActionsProps): UseFileTreeNodeActionsReturn => {
  const {
    createFile,
    createFolder,
    deleteItem,
    duplicateItem,
    copyItem,
    moveItem,
    clipboard,
    setCopyClipboard,
    setCutClipboard,
    clearClipboard,
    setConflict,
    username,
  } = useFileTreeContext();

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
            const validation = validatePasteOperation(clipboard, node.path, childrenNames);

            if (!validation.valid) {
              if (validation.reason === 'invalid-target') {
                toast.error('Cannot paste a folder into itself');
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
        case 'upload-file':
          if (!isExpanded) {
            onToggleExpand(node.path);
          }
          onTriggerFileUpload?.();
          break;
        case 'upload-folder':
          if (!isExpanded) {
            onToggleExpand(node.path);
          }
          onTriggerFolderUpload?.();
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
        owner: username ?? 'user',
      };

      onFileCreated?.(newFile);
    } catch (error) {
      captureException(error);
      toast.error('Failed to create item');
    }
  };

  return {
    isCutItem,
    handleActionClick,
    handleCreate,
  };
};
