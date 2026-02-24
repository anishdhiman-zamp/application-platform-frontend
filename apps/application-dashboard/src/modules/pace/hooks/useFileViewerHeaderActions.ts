import { useCallback } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { getNextNavigationTarget, NAVIGATION_STRATEGY } from '@zamp-platform/utils';
import { useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { getMediaUrl } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_TOAST_MESSAGES, FILE_VIEWER_HEADER_ACTION_IDS } from '@/modules/pace/components/files/files.constants';
import { useFileViewerContext } from '@/modules/pace/hooks/FileViewerContext';
import { useFileActions } from '@/modules/pace/hooks/useFileActions';
import { usePaceContext } from '@/modules/pace/pace.context';

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
  const router = useRouter();
  const { deleteItem, isDeleting } = useFileActions();
  const { dynamicTabs, closeDynamicTab } = usePaceContext();
  const { removeFileState } = useFileViewerContext();

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
    const closingTab = dynamicTabs.find((tab) => tab.id === filePath);

    if (closingTab) {
      removeFileState(closingTab.id);
      closeDynamicTab(closingTab.id);

      const { target, hasRemainingItems } = getNextNavigationTarget({
        items: dynamicTabs,
        closingItem: closingTab,
        isEqual: (a, b) => a.id === b.id,
        strategy: NAVIGATION_STRATEGY.BROWSER_LIKE,
      });

      router.push(hasRemainingItems && target ? target.path : ROUTES_PATH.CHAT_FILES);
    }

    try {
      await deleteItem(filePath);
      toast.success(FILE_TOAST_MESSAGES.FILE_DELETED);
    } catch (error) {
      captureException(error);
      toast.error(FILE_TOAST_MESSAGES.FAILED_TO_DELETE_FILE);
    }
  }, [filePath, deleteItem, dynamicTabs, closeDynamicTab, removeFileState, router]);

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
