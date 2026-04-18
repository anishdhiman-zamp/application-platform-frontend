import { useCallback, useMemo, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { FILE_TOAST_MESSAGES, FILE_VIEWER_HEADER_ACTION_IDS } from '@/modules/pace/components/files/files.constants';
import { useFileActions } from '@/modules/pace/hooks/useFileActions';
import { useFileDownload } from '@/modules/pace/hooks/useFileDownload';
import { usePaceContext } from '@/modules/pace/pace.context';
import { CHAT_SIDEBAR_STATE, TAB_TYPE } from '@/modules/pace/pace.types';

interface UseFileViewerHeaderActionsProps {
  filePath: string;
  fileName: string;
  onRenameRequested?: () => void;
}

interface UseFileViewerHeaderActionsReturn {
  handleActionClick: (actionId: string) => Promise<void>;
  isDeleting: boolean;
  deleteConfirmation: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
  };
}

export const useFileViewerHeaderActions = ({
  filePath,
  fileName,
  onRenameRequested,
}: UseFileViewerHeaderActionsProps): UseFileViewerHeaderActionsReturn => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { deleteItem, isDeleting } = useFileActions();
  const { closeTabsForPath, activeTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const { downloadFile } = useFileDownload();
  const { setPendingFileReferences, setChatSidebarState, chatSidebarState } = usePaceContext();

  const handleDownload = useCallback(async () => {
    await downloadFile({
      path: filePath,
      fileName,
    });
  }, [filePath, fileName, downloadFile]);

  const handleReferenceInChat = useCallback(() => {
    setPendingFileReferences([{ path: filePath, name: fileName }]);

    const isOnChatHome = window.location.pathname === ROUTES_PATH.CHAT && !activeTab;

    if (chatSidebarState === CHAT_SIDEBAR_STATE.COLLAPSED && !isOnChatHome) {
      setChatSidebarState(CHAT_SIDEBAR_STATE.SIDEBAR);
    }
  }, [filePath, fileName, setPendingFileReferences, setChatSidebarState, chatSidebarState, activeTab]);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      await deleteItem(filePath);
      closeTabsForPath(filePath, false);
      toast.success(FILE_TOAST_MESSAGES.FILE_DELETED);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      captureException(error);
      toast.error(FILE_TOAST_MESSAGES.FAILED_TO_DELETE_FILE);
    }
  }, [filePath, deleteItem, closeTabsForPath]);

  const handleDeleteDialogOpenChange = useCallback((open: boolean) => {
    setIsDeleteDialogOpen(open);
  }, []);

  const handleActionClick = useCallback(
    async (actionId: string) => {
      switch (actionId) {
        case FILE_VIEWER_HEADER_ACTION_IDS.DOWNLOAD:
          await handleDownload();
          break;
        case FILE_VIEWER_HEADER_ACTION_IDS.RENAME:
          onRenameRequested?.();
          break;
        case FILE_VIEWER_HEADER_ACTION_IDS.REFERENCE_IN_CHAT:
          handleReferenceInChat();
          break;
        case FILE_VIEWER_HEADER_ACTION_IDS.DELETE:
          setIsDeleteDialogOpen(true);
          break;
        default:
          break;
      }
    },
    [handleDownload, handleReferenceInChat, onRenameRequested],
  );

  const deleteConfirmation = useMemo(
    () => ({
      isOpen: isDeleteDialogOpen,
      onOpenChange: handleDeleteDialogOpenChange,
      onConfirm: handleDeleteConfirm,
    }),
    [isDeleteDialogOpen, handleDeleteDialogOpenChange, handleDeleteConfirm],
  );

  return {
    handleActionClick,
    isDeleting,
    deleteConfirmation,
  };
};
