import { memo, useEffect, useMemo } from 'react';
import { SvgSpriteLoader } from '@zamp-platform/ui/assets';
import { useGetPagesQuery, useGetProcessesQuery } from 'apis/pages';
import { ICON_SPRITE_TYPES } from 'constants/icons';
import { ROUTES_PATH, SETTING_SIDEBAR_ITEMS, SIDEBAR_ITEMS } from 'constants/routeConfig';
import { useAppSelector } from 'hooks/toolkit';
import { usePersistedPageNavigation } from 'hooks/useLastVisitedPage';
import { useLogout } from 'hooks/useLogout';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { RootState } from 'store';
import { cn } from 'utils/common';
import { useGetPaymentConfigQuery } from '@/apis/payments';
import CommonWrapper from 'components/commonWrapper';
import { SkeletonTypes } from 'components/commonWrapper/commonWrapper.types';
import PageNavTab from 'components/layouts/dashboard-layout/components/PageNavTab';
import ProcessNavTab from 'components/layouts/dashboard-layout/components/ProcessNavTab';
import SidebarTab from 'components/layouts/dashboard-layout/components/SidebarTab';
import SkeletonLoaderSidebarPages from 'components/layouts/dashboard-layout/components/SkeletonLoaderSidebarPages';

const Sidebar = () => {
  const { isSidebarOpen } = useAppSelector((state: RootState) => state.layoutConfig);
  const params = useParams();
  const router = useRouter();
  const pathname = router?.pathname;

  const { logout } = useLogout();
  const { data: pages, isLoading: isLoadingPages } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { data: processes, isLoading: isLoadingProcesses } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const { pushToMostRelevantPage } = usePersistedPageNavigation(pages ?? []);
  const { data: paymentConfig } = useGetPaymentConfigQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  useEffect(() => {
    if (pages) {
      pushToMostRelevantPage();
    }
  }, [pages]);

  const filteredSidebarItems = useMemo(
    () =>
      SIDEBAR_ITEMS.filter(
        (item) => !item?.isHidden && (item?.id !== 'payments' || (item?.id === 'payments' && paymentConfig?.id)),
      ),
    [paymentConfig],
  );

  const isLoading = isLoadingProcesses || isLoadingPages;

  useEffect(() => {
    SETTING_SIDEBAR_ITEMS.forEach((item) => {
      if (router.asPath.includes(item.path)) {
        router.prefetch(item.path);
      }
    });
  }, []);

  return (
    <div className={cn('relative transition-all', isSidebarOpen ? 'w-60' : 'w-0')}>
      <div className='w-60'>
        <AnimatePresence mode='wait'>
          {!router.pathname.includes(ROUTES_PATH.SETTINGS) ? (
            <motion.div
              key='details'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className='h-full'
            >
              <div className='px-2 border-b border-GRAY_400 pb-4'>
                {filteredSidebarItems.map((item) => (
                  <Link href={item.path} key={item.label} className='cursor-pointer'>
                    <SidebarTab
                      key={item?.label}
                      name={item?.label}
                      iconId={item?.iconId}
                      isSelected={!params?.pageId && !params?.processId && pathname.includes(item?.path)}
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
                    {processes
                      ?.map((process) => ({
                        ...process,
                        fractionalIndex: process?.fractional_index,
                      }))
                      .sort((processA, processB) => processA?.fractionalIndex - processB?.fractionalIndex)
                      .map((process) => (
                        <ProcessNavTab
                          key={process?.id}
                          label={process?.display_name}
                          processId={process?.id}
                          isSelected={params?.processId === process?.id}
                        />
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
                      <PageNavTab
                        key={item?.page_id}
                        label={item?.name}
                        pageId={item?.page_id}
                        isSelected={params?.pageId === item?.page_id}
                      />
                    ))}
                  </CommonWrapper>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key='list'
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, type: 'spring' }}
            >
              <div className='w-60 absolute px-2 -top-12 left-0 z-10 bg-BACKGROUND_GRAY_1'>
                <div className='text-GRAY_700 py-4 flex items-center gap-2 f-13-500 select-none'>
                  <SvgSpriteLoader id='arrow-left' size={16} onClick={() => router.back()} />
                  Settings
                </div>
                <div className='flex flex-col '>
                  {SETTING_SIDEBAR_ITEMS.map((item) => (
                    <button className='inline' key={item.id} onClick={() => router.replace(item?.path)}>
                      <SidebarTab
                        key={item?.id}
                        name={item?.label}
                        iconId={item?.iconId}
                        isSelected={router.asPath.includes(item?.path)}
                        className='text-GRAY_1000'
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className='border-t border-GRAY_400 px-4 py-3 absolute bottom-0 w-full cursor-pointer h-[57px] flex items-center gap-2.5 text-GRAY_900'
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
