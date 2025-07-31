'use client';

import { useEffect } from 'react';
import { useGetPagesQuery, useGetProcessesQuery } from '@/apis/pages';
import CommonWrapper from '@/components/commonWrapper';
import { SkeletonTypes } from '@/components/commonWrapper/commonWrapper.types';
import DynamicLottiePlayer from '@/components/DynamicLottiePlayer';
import { ZAMP_LOGO_LOADER } from '@/constants/lottie/zamp-logo-loader';
import { useAppSelector } from '@/hooks/toolkit';
import { usePersistedPageNavigation } from '@/hooks/useLastVisitedPage';

export default function Page() {
  const { isOrgSwitchIsInProgress } = useAppSelector((state) => state.user);
  const { data: processes } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const { data: pages } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const { pushToMostRelevantProcess, pushToMostRelevantPage } = usePersistedPageNavigation({
    processesList: processes ?? [],
    pagesList: pages ?? [],
  });

  useEffect(() => {
    if (isOrgSwitchIsInProgress) window.location.reload();
    if (processes && processes?.length > 0) {
      pushToMostRelevantProcess();
    } else if (pages && pages?.length > 0) {
      pushToMostRelevantPage();
    }
  }, [processes, pages, isOrgSwitchIsInProgress]);

  return (
    <CommonWrapper
      isLoading={true}
      skeletonType={SkeletonTypes.CUSTOM}
      loader={
        <div className='z-50 flex h-screen w-full items-center justify-center bg-white'>
          <DynamicLottiePlayer src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay loop keepLastFrame />
        </div>
      }
    >
      <></>
    </CommonWrapper>
  );
}
