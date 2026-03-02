'use client';

import { useScopedTabs } from 'modules/pace/components/dynamic-tabs/useScopedTabs';
import { useFileViewerContext } from '@/modules/pace/context/FileViewerContext';
import { TAB_TYPE } from '@/modules/pace/pace.types';

export const useFileTabs = () => {
  const { removeFileState, updateFileStatePath, updateFileStatePathsForFolder } = useFileViewerContext();

  return useScopedTabs({
    type: TAB_TYPE.FILE,
    onTabClose: removeFileState,
    onTabUpdate: updateFileStatePath,
    onFolderMove: updateFileStatePathsForFolder,
  });
};
