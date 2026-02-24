'use client';

import { useEffect } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import FileViewerTab from 'modules/pace/components/file-viewer/FileViewerTab';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { usePaceContext } from '@/modules/pace/pace.context';

interface FileTabsContainerProps {
  currentFilePath: string;
}

const FileTabsContainer = ({ currentFilePath }: FileTabsContainerProps) => {
  const { dynamicTabs, isDynamicTabsHydrated, activeFileTabKey, setActiveFileTabKey, openDynamicTab } =
    usePaceContext();

  useEffect(() => {
    if (!isDynamicTabsHydrated || !currentFilePath) return;

    const matchingTab = dynamicTabs.find((tab) => tab.id === currentFilePath);

    if (matchingTab) {
      setActiveFileTabKey(matchingTab.stableKey);

      return;
    }
  }, [currentFilePath, dynamicTabs, isDynamicTabsHydrated, activeFileTabKey, setActiveFileTabKey, openDynamicTab]);

  if (!isDynamicTabsHydrated || dynamicTabs.length === 0) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  return (
    <div className='relative h-full w-full'>
      {dynamicTabs.map((tab) => {
        const isActive = tab.stableKey === activeFileTabKey;

        return (
          <div
            key={tab.stableKey}
            className={cn(
              'absolute inset-0',
              isActive ? 'pointer-events-auto visible z-1' : 'pointer-events-none invisible z-0',
            )}
          >
            <FileViewerTab filePath={tab.id} isActive={isActive} />
          </div>
        );
      })}
    </div>
  );
};

export default FileTabsContainer;
