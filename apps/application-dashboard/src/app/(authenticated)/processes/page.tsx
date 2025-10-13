'use client';

import { useEffect } from 'react';
import { useGetPagesQuery, useGetProcessesQuery } from '@/apis/pages';
import ZampLogoGifLoader from '@/components/common/loader/ZampLogoGifLoader';
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

  return <ZampLogoGifLoader />;
}
