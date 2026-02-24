import { useCallback } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { getMediaUrl } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_TOAST_MESSAGES, FILE_VIEWER_HEADER_ACTION_IDS } from '@/modules/pace/components/files/files.constants';
import { useDynamicTabs } from '@/modules/pace/hooks/useDynamicTabs';
import { useFileActions } from '@/modules/pace/hooks/useFileActions';

interface UseFileViewerHeaderActionsProps {
  filePath: string;
  fileName: string;
}

interface UseFileViewerHeaderActionsReturn {
  handleActionClick: (actionId: string) => Promise<void>;
  isDeleting: boolean;
}

export const useFileViewerHeaderActions = ({
  filePath,
  fileName,
}: UseFileViewerHeaderActionsProps): UseFileViewerHeaderActionsReturn => {
  const { deleteItem, isDeleting } = useFileActions();
  const { closeTabsForPath } = useDynamicTabs();

  const handleDownload = useCallback(() => {
    const downloadUrl = getMediaUrl(filePath);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filePath, fileName]);

  const handleDelete = useCallback(async () => {
    closeTabsForPath(filePath, false);

    try {
      await deleteItem(filePath);
      toast.success(FILE_TOAST_MESSAGES.FILE_DELETED);
    } catch (error) {
      captureException(error);
      toast.error(FILE_TOAST_MESSAGES.FAILED_TO_DELETE_FILE);
    }
  }, [filePath, deleteItem, closeTabsForPath]);

  const handleActionClick = useCallback(
    async (actionId: string) => {
      switch (actionId) {
        case FILE_VIEWER_HEADER_ACTION_IDS.DOWNLOAD:
          handleDownload();
          break;
        case FILE_VIEWER_HEADER_ACTION_IDS.DELETE:
          await handleDelete();
          break;
        default:
          break;
      }
    },
    [handleDownload, handleDelete],
  );

  return {
    handleActionClick,
    isDeleting,
  };
};
