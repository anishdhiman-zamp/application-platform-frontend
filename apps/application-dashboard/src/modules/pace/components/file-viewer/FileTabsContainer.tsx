'use client';

import FileViewerTab from 'modules/pace/components/file-viewer/FileViewerTab';
import { useMountedTabs } from 'modules/pace/components/file-viewer/useMountedTabs';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import TabWrapper from '@/modules/pace/components/dynamic-tabs/TabWrapper';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { useFileViewerContext } from '@/modules/pace/context/FileViewerContext';
import { TAB_TYPE } from '@/modules/pace/pace.types';

const FileTabsContainer = () => {
  const { removeFileState, updateFileStatePath, updateFileStatePathsForFolder } = useFileViewerContext();
  const { tabs, activeTab, isHydrated, closeTab } = useDynamicTabs({
    type: TAB_TYPE.FILE,
    onTabClose: removeFileState,
    onTabUpdate: updateFileStatePath,
    onFolderMove: updateFileStatePathsForFolder,
  });

  const { isMounted } = useMountedTabs(tabs, activeTab?.stableKey ?? null);

  if (!isHydrated || !tabs?.length) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  return (
    <div className='relative h-full w-full'>
      {tabs?.map((tab) => {
        const isActive = activeTab?.stableKey === tab?.stableKey;

        if (!isMounted(tab.stableKey)) return null;

        return (
          <TabWrapper key={tab?.stableKey} isActive={isActive}>
            <FileViewerTab filePath={tab?.id} isActive={isActive} onCloseTab={closeTab} />
          </TabWrapper>
        );
      })}
    </div>
  );
};

export default FileTabsContainer;
