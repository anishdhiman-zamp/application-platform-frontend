import { useCallback, useState } from 'react';
import { captureException } from '@sentry/browser';
import { toast } from '@zamp-platform/ui';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { FILE_TYPE } from '@/modules/pace/components/files/file-tree.types';
import { buildFullPath, getParentPath } from '@/modules/pace/components/files/file-tree.utils';
import { FILE_TOAST_MESSAGES } from '@/modules/pace/components/files/files.constants';
import { useFileTreeNavigation } from '@/modules/pace/context/FileTreeNavigationContext';
import { useFileViewerContext } from '@/modules/pace/context/FileViewerContext';
import { useFileActions } from '@/modules/pace/hooks/useFileActions';
import { useSiblingNames } from '@/modules/pace/hooks/useSiblingNames';
import { TAB_TYPE } from '@/modules/pace/pace.types';
import { defaultFnType } from '@/types/commonTypes';

interface UseFileViewerHeaderRenameProps {
  filePath: string;
  fileName: string;
}

interface UseFileViewerHeaderRenameReturn {
  isRenameDialogOpen: boolean;
  isRenameLoading: boolean;
  siblingNames: string[];
  openRenameDialog: defaultFnType;
  setRenameDialogOpen: (open: boolean) => void;
  handleRenameSubmit: (newName: string) => Promise<void>;
}

export const useFileViewerHeaderRename = ({
  filePath,
  fileName,
}: UseFileViewerHeaderRenameProps): UseFileViewerHeaderRenameReturn => {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const { renameItem, isRenaming: isRenameLoading } = useFileActions();
  const { updateFileStatePath } = useFileViewerContext();
  const { updateTab } = useDynamicTabs({ type: TAB_TYPE.FILE });
  const { siblingNames, refetchSiblings } = useSiblingNames({ filePath });
  const { revealPathInTree } = useFileTreeNavigation();

  const openRenameDialog = useCallback(() => {
    setIsRenameDialogOpen(true);
    refetchSiblings();
  }, [refetchSiblings]);

  const handleRenameSubmit = useCallback(
    async (newName: string) => {
      setIsRenameDialogOpen(false);

      const parentPath = getParentPath(filePath);
      const newPath = buildFullPath(parentPath, newName);

      updateFileStatePath(filePath, newPath);
      updateTab(filePath, newPath, newName);
      revealPathInTree(newPath);

      try {
        await renameItem(filePath, newName, {
          name: fileName,
          type: FILE_TYPE.FILE,
          size: null,
          owner: '',
        });
      } catch (error) {
        captureException(error);
        toast.error(FILE_TOAST_MESSAGES.FAILED_TO_RENAME);

        updateFileStatePath(newPath, filePath);
        updateTab(newPath, filePath, fileName);
      }
    },
    [fileName, filePath, renameItem, updateFileStatePath, updateTab, revealPathInTree],
  );

  return {
    isRenameDialogOpen,
    isRenameLoading,
    siblingNames,
    openRenameDialog,
    setRenameDialogOpen: setIsRenameDialogOpen,
    handleRenameSubmit,
  };
};
