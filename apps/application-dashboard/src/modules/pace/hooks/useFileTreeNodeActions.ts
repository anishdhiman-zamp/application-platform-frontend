import { useCallback, useState } from 'react';
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
  getMediaUrl,
  validatePasteOperation,
} from '@/modules/pace/components/files/file-tree.utils';
import { CONTEXT_MENU_ACTION_IDS, FILE_TOAST_MESSAGES } from '@/modules/pace/components/files/files.constants';
import { useDynamicTabs } from '@/modules/pace/hooks/useDynamicTabs';
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
  deleteConfirmation: {
    isOpen: boolean;
    isDeleting: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
  };
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { openTab, closeTabsForPath, updateTab, updateTabsForFolderMove } = useDynamicTabs();
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
        case CONTEXT_MENU_ACTION_IDS.DELETE: {
          if (isProtected) {
            toast.error(FILE_TOAST_MESSAGES.CANNOT_DELETE_PROTECTED);
            break;
          }
          setIsDeleteDialogOpen(true);
          break;
        }
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
              if (clipboard.type === FILE_TYPE.DIRECTORY) {
                updateTabsForFolderMove(clipboard.path, validation.destinationPath);
              } else {
                updateTab(clipboard.path, validation.destinationPath, clipboard.name);
              }
            }
          }
          break;
        case CONTEXT_MENU_ACTION_IDS.OPEN_IN_TAB: {
          openTab(node.path, node.name);
          break;
        }
        case CONTEXT_MENU_ACTION_IDS.DOWNLOAD: {
          const downloadUrl = getMediaUrl(node.path);
          const link = document.createElement('a');

          link.href = downloadUrl;
          link.download = node.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          break;
        }
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
      toast.error(FILE_TOAST_MESSAGES.FAILED_TO_CREATE_ITEM);
    }
  };

  const handleDeleteConfirm = useCallback(async () => {
    const isFolder = node.type === FILE_TYPE.DIRECTORY;

    setIsDeleting(true);
    try {
      closeTabsForPath(node.path, isFolder);
      await deleteItem(node.path);
      onFileDeleted?.(node.path);
      toast.success(isFolder ? FILE_TOAST_MESSAGES.FOLDER_DELETED : FILE_TOAST_MESSAGES.FILE_DELETED);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      captureException(error);
      toast.error(FILE_TOAST_MESSAGES.FAILED_TO_DELETE_ITEM);
    } finally {
      setIsDeleting(false);
    }
  }, [node.path, node.type, closeTabsForPath, deleteItem, onFileDeleted]);

  const handleDeleteDialogOpenChange = useCallback((open: boolean) => {
    setIsDeleteDialogOpen(open);
  }, []);

  return {
    isCutItem,
    handleActionClick,
    handleCreate,
    deleteConfirmation: {
      isOpen: isDeleteDialogOpen,
      isDeleting,
      onOpenChange: handleDeleteDialogOpenChange,
      onConfirm: handleDeleteConfirm,
    },
  };
};
