import { useMemo } from 'react';
import Link from 'next/link';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import PagesNavigation from '@/components/layouts/dashboard-layout/components/PagesNavigation';
import ProcessNavTab from '@/components/layouts/dashboard-layout/components/ProcessNavTab';
import SkeletonLoaderSidebarPages from '@/components/layouts/dashboard-layout/components/SkeletonLoaderSidebarPages';
import { getProcessRouteById } from '@/constants/routeConfig';
import { usePagesAndProcesses } from '@/contexts/PagesAndProcessesContext';

const SidebarDynamicNavItems = ({ params }: { params: { pageId?: string; processId?: string } }) => {
  const { pages, processes, isLoading: isLoadingPagesOrProcesses } = usePagesAndProcesses();

  const sortedPages = useMemo(() => {
    if (pages && pages?.length > 0) {
      return [...pages].sort((a, b) => a?.fractional_index - b?.fractional_index);
    }

    return [];
  }, [pages]);

  const isLoading = isLoadingPagesOrProcesses;

  return (
    <>
      <CommonWrapper
        isLoading={isLoading}
        skeletonType={SkeletonTypes.CUSTOM}
        loader={<SkeletonLoaderSidebarPages />}
        className='px-2 py-2.5'
      >
        {processes && processes?.length > 0 && (
          <>
            <div className='f-12-550 text-GRAY_700 px-1.5 py-2'>Processes</div>
            {processes?.map((process) => (
              <Link prefetch href={getProcessRouteById(process?.id)} key={process?.id} className='cursor-pointer'>
                <ProcessNavTab
                  label={process?.display_name}
                  processId={process?.id}
                  isSelected={params?.processId === process?.id}
                />
              </Link>
            ))}
          </>
        )}
      </CommonWrapper>

      <PagesNavigation pages={sortedPages} processes={processes} isLoading={isLoading} params={params} />
    </>
  );
};

export default SidebarDynamicNavItems;
