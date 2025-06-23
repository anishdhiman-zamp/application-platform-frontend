'use client';

import { memo, useEffect } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useGetPagesQuery, useGetProcessesQuery } from 'apis/pages';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { getPageRouteById, getProcessRouteById, SIDEBAR_ITEMS } from 'constants/routeConfig';
import { useAppSelector } from 'hooks/toolkit';
import { usePersistedPageNavigation } from 'hooks/useLastVisitedPage';
import { useLogout } from 'hooks/useLogout';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { RootState } from 'store';
import { cn } from 'utils/common';
import { useHash } from '@/hooks/useHash';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import PageNavTab from 'components/layouts/dashboard-layout/components/PageNavTab';
import ProcessNavTab from 'components/layouts/dashboard-layout/components/ProcessNavTab';
import SidebarTab from 'components/layouts/dashboard-layout/components/SidebarTab';
import SkeletonLoaderSidebarPages from 'components/layouts/dashboard-layout/components/SkeletonLoaderSidebarPages';

const Sidebar = () => {
  const { isSidebarOpen } = useAppSelector((state: RootState) => state.layoutConfig);
  const params = useParams();
  const pathTrim = usePathname();
  const hash = useHash();
  const pathname = pathTrim + hash;

  const { logout } = useLogout();
  const { data: pages, isLoading: isLoadingPages } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data: processes, isLoading: isLoadingProcesses } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { pushToMostRelevantPage, pushToMostRelevantProcess } = usePersistedPageNavigation({
    pagesList: pages ?? [],
    processesList: processes ?? [],
  });

  useEffect(() => {
    if (processes) {
      pushToMostRelevantProcess();
    } else if (pages) {
      pushToMostRelevantPage();
    }
  }, [pages, processes]);

  const isLoading = isLoadingProcesses || isLoadingPages;

  return (
    <div className={cn('relative transition-all', isSidebarOpen ? 'w-60' : 'w-0')}>
      <div className='w-60'>
        <div className='h-full'>
          <div className='border-GRAY_400 border-b px-2 pb-4'>
            {SIDEBAR_ITEMS.map((item) => (
              <Link href={item.path} key={item.label} className='cursor-pointer'>
                <SidebarTab
                  key={item?.label}
                  name={item?.label}
                  iconId={item?.iconId}
                  isSelected={!params?.pageId && !params?.processId && pathname?.includes(item?.path)}
                />
              </Link>
            ))}
          </div>
          {processes && processes?.length > 0 && (
            <div className='px-2 py-2.5'>
              <div className='f-12-550 text-GRAY_700 px-1.5 py-2'>Processes</div>
              <CommonWrapper
                isLoading={isLoading}
                skeletonType={SkeletonTypes.CUSTOM}
                loader={<SkeletonLoaderSidebarPages />}
              >
                {processes?.map((process) => (
                  <Link href={getProcessRouteById(process?.id)} key={process?.id} className='cursor-pointer'>
                    <ProcessNavTab
                      label={process?.display_name}
                      processId={process?.id}
                      isSelected={params?.processId === process?.id}
                    />
                  </Link>
                ))}
              </CommonWrapper>
            </div>
          )}
          {!!pages?.length && (
            <div className={cn('px-2', processes?.length === 0 ? 'py-2.5' : 'py-0')}>
              <div className='f-12-550 text-GRAY_700 px-1.5 py-2'>Pages</div>
              <CommonWrapper
                isLoading={isLoading}
                skeletonType={SkeletonTypes.CUSTOM}
                loader={<SkeletonLoaderSidebarPages />}
              >
                {pages?.map((item) => (
                  <Link href={getPageRouteById(item?.page_id)} key={item?.page_id} className='cursor-pointer'>
                    <PageNavTab
                      key={item?.page_id}
                      label={item?.name}
                      pageId={item?.page_id}
                      isSelected={params?.pageId === item?.page_id}
                    />
                  </Link>
                ))}
              </CommonWrapper>
            </div>
          )}
        </div>
        <div
          className='border-GRAY_400 text-GRAY_900 absolute bottom-0 flex h-[57px] w-full cursor-pointer items-center gap-2.5 border-t px-4 py-3'
          onClick={logout}
        >
          <SvgSpriteLoader iconCategory={ICON_SPRITE_TYPES.GENERAL} id='log-out-02' height={14} width={14} />
          <div className='f-13-500'>Logout</div>
        </div>
      </div>
    </div>
  );
};

export default memo(Sidebar);
