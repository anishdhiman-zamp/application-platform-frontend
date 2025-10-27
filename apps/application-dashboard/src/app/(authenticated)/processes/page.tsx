'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGetPagesQuery, useGetProcessesQuery } from '@/apis/pages';
import ZampLogoWebpLoader from '@/components/common/loader/ZampLogoWebpLoader';
import { ROUTES_PATH } from '@/constants/routeConfig';
import { useAppSelector } from '@/hooks/toolkit';
import { usePersistedPageNavigation } from '@/hooks/useLastVisitedPage';

export default function Page() {
  const { isOrgSwitchIsInProgress } = useAppSelector((state) => state.user);
  const { data: processes, isSuccess: isSuccessProcesses } = useGetProcessesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });
  const router = useRouter();

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
      } else {
        router.push(ROUTES_PATH.TEAM);
      }
    }
  }, [processes, pages, isOrgSwitchIsInProgress, isSuccessProcesses, isSuccessPages]);

  return <ZampLogoWebpLoader />;
}
