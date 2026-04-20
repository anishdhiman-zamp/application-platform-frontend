import { useCallback, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
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
import { dispatchFileCreated, markFileCreationPending } from '@/modules/pace/hooks/pendingFileCreation';
import { useFileDownload } from '@/modules/pace/hooks/useFileDownload';
import { useFileTreeContext } from '@/modules/pace/hooks/useFileTreeContext';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';

interface UseFileTreeNodeActionsProps {
  node: TreeNode;
  isExpanded: boolean;
  childrenNames: string[];
  siblingNames: string[];
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
  onShowInfo?: () => void;
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
  siblingNames,
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
  onShowInfo,
}: UseFileTreeNodeActionsProps): UseFileTreeNodeActionsReturn => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { openTab, closeTabsForPath, updateTab, updateTabsForFolderMove, activeTab } = useDynamicTabs({
    type: TAB_TYPE.FILE,
  });
  const { downloadFile } = useFileDownload();
  const { setPendingFileReferences, setChatSidebarState, chatSidebarState } = usePaceContext();
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
    const isOnChatHome = window.location.pathname === ROUTES_PATH.CHAT && !activeTab;

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
          await duplicateItem(
            node.path,
            { name: node.name, type: node.type, size: node.size, owner: node.owner },
            siblingNames,
          );
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
        case CONTEXT_MENU_ACTION_IDS.REFERENCE_IN_CHAT: {
          setPendingFileReferences([{ path: node.path, name: node.name }]);
          if (chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED && !isOnChatHome) {
            setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
          }
          break;
        }
        case CONTEXT_MENU_ACTION_IDS.DOWNLOAD: {
          const isFolder = node.type === FILE_TYPE.DIRECTORY;
          const fileName = isFolder ? `${node.name}.zip` : node.name;

          await downloadFile({
            path: node.path,
            fileName,
          });
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
        case CONTEXT_MENU_ACTION_IDS.INFO:
          onShowInfo?.();
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
    const fullPath = buildFullPath(parentPath, name);
    const newFile: FileItem = {
      path: fullPath,
      name,
      type: createModalType === CREATE_ITEM_TYPE.FILE ? FILE_TYPE.FILE : FILE_TYPE.DIRECTORY,
      size: 0,
      mtime_ms: Date.now(),
      owner: username ?? 'user',
    };

    if (createModalType === CREATE_ITEM_TYPE.FILE) {
      markFileCreationPending(fullPath);
      openTab(fullPath, name);
    }

    onFileCreated?.(newFile);

    try {
      if (createModalType === CREATE_ITEM_TYPE.FILE) {
        await createFile(name, parentPath);
        dispatchFileCreated(fullPath);
      } else {
        await createFolder(name, parentPath);
      }
    } catch (error) {
      dispatchFileCreated(fullPath);
      captureException(error);
      toast.error(FILE_TOAST_MESSAGES.FAILED_TO_CREATE_ITEM);
    }
  };

  const handleDeleteConfirm = useCallback(async () => {
    const isFolder = node.type === FILE_TYPE.DIRECTORY;

    setIsDeleting(true);
    closeTabsForPath(node.path, isFolder);
    onFileDeleted?.(node.path);
    setIsDeleteDialogOpen(false);

    try {
      await deleteItem(node.path);
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
