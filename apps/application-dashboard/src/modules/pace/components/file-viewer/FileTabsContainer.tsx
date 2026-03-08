'use client';

import { memo } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import FileViewerTab from 'modules/pace/components/file-viewer/FileViewerTab';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import { useFileTabs } from '@/modules/pace/components/dynamic-tabs/useFileTabs';

const FileTabsContainer = () => {
  const { tabs, activeTab, isHydrated, closeTab } = useFileTabs();

  if (!isHydrated || !tabs?.length) {
    return <ImageLoader imageSrc={ZAMP_LOGO_LOADER_SVG} width={140} height={140} />;
  }

  return (
    <div className='relative h-full w-full'>
      {tabs?.map((tab) => {
        const isActive = activeTab?.stableKey === tab?.stableKey;

        return (
          <TabWrapper key={tab?.stableKey} isActive={isActive}>
            <FileViewerTab filePath={tab?.id} isActive={isActive} onCloseTab={closeTab} />
          </TabWrapper>
        );
      })}
    </div>
  );
};

const TabWrapper = memo(({ isActive, children }: { isActive: boolean; children: React.ReactNode }) => (
  <div
    className={cn(
      'absolute inset-0',
      isActive ? 'pointer-events-auto visible z-1' : 'pointer-events-none invisible z-0',
    )}
  >
    {children}
  </div>
));

TabWrapper.displayName = 'TabWrapper';

export default FileTabsContainer;
