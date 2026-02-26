'use client';

import { useEffect } from 'react';
import { cn } from '@zamp-platform/ui/utils';
import FileViewerTab from 'modules/pace/components/file-viewer/FileViewerTab';
import { useRouter } from 'next/navigation';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { usePaceContext } from '@/modules/pace/pace.context';

interface FileTabsContainerProps {
  currentFilePath: string;
}

const FileTabsContainer = ({ currentFilePath }: FileTabsContainerProps) => {
  const router = useRouter();
  const { dynamicTabs, activeFileTabKey, setActiveFileTabKey } = usePaceContext();

  useEffect(() => {
    const matchingTab = dynamicTabs.find((tab) => tab.id === currentFilePath);

    if (matchingTab) {
      setActiveFileTabKey(matchingTab.stableKey);
    }
  }, [currentFilePath, dynamicTabs, setActiveFileTabKey]);

  if (dynamicTabs.length === 0) {
    router.push(ROUTES_PATH.CHAT_FILES);

    return null;
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
