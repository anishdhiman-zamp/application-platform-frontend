'use client';

import { useEffect, useMemo } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import FileViewerTab from 'modules/pace/components/file-viewer/FileViewerTab';
import { usePaceContext } from '@/modules/pace/pace.context';
import { DynamicTabType } from '@/modules/pace/pace.types';

interface FileTabsContainerProps {
  currentFilePath: string;
}

const FileTabsContainer = ({ currentFilePath }: FileTabsContainerProps) => {
  const { dynamicTabs, activeFileTabKey, setActiveFileTabKey } = usePaceContext();

  const fileTabs = useMemo(() => {
    return dynamicTabs.filter((tab) => tab.type === DynamicTabType.FILE);
  }, [dynamicTabs]);

  useEffect(() => {
    const matchingTab = fileTabs.find((tab) => tab.id === currentFilePath);

    if (matchingTab) {
      setActiveFileTabKey(matchingTab.stableKey);
    }
  }, [currentFilePath, fileTabs, setActiveFileTabKey]);

  if (fileTabs.length === 0) {
    return null;
  }

  return (
    <div className='relative h-full w-full'>
      {fileTabs.map((tab) => {
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
