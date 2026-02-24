'use client';

import { cn } from '@zamp-platform/ui/utils';
import FileViewerTab from 'modules/pace/components/file-viewer/FileViewerTab';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useDynamicTabs } from '@/modules/pace/hooks/useDynamicTabs';

const FileTabsContainer = () => {
  const { tabs, activeTab, isHydrated } = useDynamicTabs();

  if (!isHydrated || tabs.length === 0) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  return (
    <div className='relative h-full w-full'>
      {tabs.map((tab) => {
        const isActive = activeTab?.stableKey === tab.stableKey;

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
