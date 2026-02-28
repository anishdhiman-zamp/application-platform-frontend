'use client';

import { useScopedTabs } from 'modules/pace/components/dynamic-tabs/useScopedTabs';
import { useFileViewerContext } from '@/modules/pace/context/FileViewerContext';

export const useFileTabs = () => {
  const { removeFileState, updateFileStatePath, updateFileStatePathsForFolder } = useFileViewerContext();

  return useScopedTabs({
    type: 'file',
    onTabClose: removeFileState,
    onTabUpdate: updateFileStatePath,
    onFolderMove: updateFileStatePathsForFolder,
  });
};
