import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useRouter } from 'next/navigation';
import { getChatFileRoute } from '@/constants/routeConfig';
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
import { useFileTreeContext } from '@/modules/pace/hooks/useFileTreeContext';
import { usePaceContext } from '@/modules/pace/pace.context';
import { DynamicTabType } from '@/modules/pace/pace.types';

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
  const router = useRouter();
  const { openDynamicTab } = usePaceContext();
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
        case CONTEXT_MENU_ACTION_IDS.OPEN_IN_TAB: {
          const filePath = getChatFileRoute(node.path);

          openDynamicTab({
            id: node.path,
            name: node.name,
            type: DynamicTabType.FILE,
            path: filePath,
          });
          router.push(filePath);
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

  return {
    isCutItem,
    handleActionClick,
    handleCreate,
  };
};
