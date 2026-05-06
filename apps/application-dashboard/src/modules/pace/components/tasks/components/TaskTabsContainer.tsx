'use client';

import { usePathname } from 'next/navigation';
import ImageLoader from '@/components/common/loader/ImageLoader';
import { ZAMP_LOGO_LOADER_SVG } from '@/constants/icons';
import TabWrapper from '@/modules/pace/components/dynamic-tabs/TabWrapper';
import { useDynamicTabs } from '@/modules/pace/components/dynamic-tabs/useDynamicTabs';
import { useMountedTabs } from '@/modules/pace/components/file-viewer/useMountedTabs';
import { getTaskContentChrome } from '@/modules/pace/components/files-panel/files-panel.utils';
import TaskContentInner from '@/modules/pace/module/TaskContentInner';
import { TAB_TYPE } from '@/modules/pace/pace.types';

const TaskTabsContainer = () => {
  const { tabs, activeTab, isHydrated } = useDynamicTabs({ type: TAB_TYPE.TASK });
  const pathname = usePathname();

  const { isMounted } = useMountedTabs(tabs, activeTab?.stableKey ?? null);
  const chrome = getTaskContentChrome(pathname);

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
            <TaskContentInner key={tab.id} taskId={tab.id} chrome={chrome} isActive={isActive} />
          </TabWrapper>
        );
      })}
    </div>
  );
};

export default TaskTabsContainer;
