import { useMemo } from 'react';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import PagesNavigation from '@/components/layouts/dashboard-layout/components/PagesNavigation';
import ProcessNavigation from '@/components/layouts/dashboard-layout/components/ProcessNavigation';
import SkeletonLoaderSidebarPages from '@/components/layouts/dashboard-layout/components/SkeletonLoaderSidebarPages';
import { usePagesAndProcesses } from '@/contexts/PagesAndProcessesContext';

const SidebarDynamicNavItems = ({ params }: { params: { pageId?: string; processId?: string } }) => {
  const { pages, processes, isLoading, deleteProcess, updateProcess } = usePagesAndProcesses();

  const sortedPages = useMemo(() => {
    if (pages && pages?.length > 0) {
      return [...pages].sort((a, b) => a?.fractional_index - b?.fractional_index);
    }

    return [];
  }, [pages]);

  return (
    <CommonWrapper
      isLoading={isLoading}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={<SkeletonLoaderSidebarPages />}
      className='px-2 py-2.5'
    >
      <ProcessNavigation
        processes={processes}
        params={params}
        deleteProcess={deleteProcess}
        updateProcess={updateProcess}
      />
      <PagesNavigation pages={sortedPages} params={params} />
    </CommonWrapper>
  );
};

export default SidebarDynamicNavItems;
