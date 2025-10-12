'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useGetPagesQuery, useGetProcessesQuery } from '@/apis/pages';
import { ZAMP_LOGO_LOADER_GIF } from '@/constants/icons';
import { useAppSelector } from '@/hooks/toolkit';
import { usePersistedPageNavigation } from '@/hooks/useLastVisitedPage';

export default function Page() {
  const { isOrgSwitchIsInProgress } = useAppSelector((state) => state.user);
  const { data: processes, isSuccess: isSuccessProcesses } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const { data: pages, isSuccess: isSuccessPages } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const { pushToMostRelevantProcess, pushToMostRelevantPage } = usePersistedPageNavigation({
    processesList: processes ?? [],
    pagesList: pages ?? [],
  });

  useEffect(() => {
    if (isOrgSwitchIsInProgress) window.location.reload();
    if (isSuccessProcesses && isSuccessPages) {
      if (processes && processes?.length > 0) {
        pushToMostRelevantProcess();
      } else if (pages && pages?.length > 0) {
        pushToMostRelevantPage();
      }
    }
  }, [processes, pages, isOrgSwitchIsInProgress, isSuccessProcesses, isSuccessPages]);

  return (
    <div className='flex h-full w-full items-center justify-center rounded-tl-xl bg-white'>
      <Image src={ZAMP_LOGO_LOADER_GIF} alt='zamp logo loader' width={140} height={140} unoptimized />
    </div>
  );
}
