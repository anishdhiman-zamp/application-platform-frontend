'use client';

import { memo, useEffect, useMemo } from 'react';
import { useGetPagesQuery, useGetProcessesQuery } from 'apis/pages';
import { getProcessRouteById } from 'constants/routeConfig';
import { useAppSelector } from 'hooks/toolkit';
import { usePersistedPageNavigation } from 'hooks/useLastVisitedPage';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { RootState } from 'store';
import { cn } from 'utils/common';
import { SIDEBAR_ITEMS } from '@/constants/sidebar.constants';
import { useHash } from '@/hooks/useHash';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import OrgSwitcher from 'components/layouts/dashboard-layout/components/OrgSwitcher';
import PagesNavigation from 'components/layouts/dashboard-layout/components/PagesNavigation';
import ProcessNavTab from 'components/layouts/dashboard-layout/components/ProcessNavTab';
import SidebarTab from 'components/layouts/dashboard-layout/components/SidebarTab';
import SkeletonLoaderSidebarPages from 'components/layouts/dashboard-layout/components/SkeletonLoaderSidebarPages';

const Sidebar = () => {
  const { isSidebarOpen } = useAppSelector((state: RootState) => state.layoutConfig);
  const params = useParams();
  const pathTrim = usePathname();
  const hash = useHash();
  const pathname = pathTrim + hash;

  const {
    data: pages,
    isLoading: isLoadingPages,
    isSuccess: isSuccessPages,
  } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const {
    data: processes,
    isLoading: isLoadingProcesses,
    isSuccess: isSuccessProcesses,
  } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { pushToMostRelevantPage, pushToMostRelevantProcess } = usePersistedPageNavigation({
    pagesList: pages ?? [],
    processesList: processes ?? [],
  });

  const sortedPages = useMemo(() => {
    if (pages && pages?.length > 0) {
      return [...pages].sort((a, b) => a?.fractional_index - b?.fractional_index);
    }

    return [];
  }, [pages]);

  useEffect(() => {
    if (isSuccessPages && isSuccessProcesses) {
      if (processes && processes?.length > 0) {
        pushToMostRelevantProcess();
      } else if (pages && pages?.length > 0) {
        pushToMostRelevantPage();
      }
    }
  }, [pages, processes, isSuccessPages, isSuccessProcesses]);

  const isLoading = isLoadingProcesses || isLoadingPages;

  return (
    <div className='bg-BACKGROUND_GRAY_1 relative z-20 flex transition-all'>
      <div className={cn('relative transition-all', isSidebarOpen ? 'w-60' : 'invisible w-0 opacity-0')}>
        <div className='w-60'>
          <div className='h-full'>
            <div className='border-GRAY_400 border-b px-2 pb-4'>
              {SIDEBAR_ITEMS.map((item) => (
                <Link prefetch href={item.path} key={item.label} className='cursor-pointer'>
                  <SidebarTab
                    key={item.label}
                    name={item.label}
                    iconComponent={item.iconComponent}
                    isSelected={!params?.pageId && !params?.processId && pathname?.includes(item?.path)}
                  />
                </Link>
              ))}
            </div>

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
          </div>
          <OrgSwitcher isSidebarOpen={isSidebarOpen} />
        </div>
      </div>
      <div className='bg-GRAY_400 absolute right-0 h-[calc(100vh-64px)] w-[1px] translate-x-[1px] translate-y-4' />
    </div>
  );
};

export default memo(Sidebar);
