'use client';

import { useEffect } from 'react';
import { useGetPagesQuery, useGetProcessesQuery } from '@/apis/pages';
import { usePersistedPageNavigation } from '@/hooks/useLastVisitedPage';

export default function Page() {
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
    if (processes && processes?.length > 0) {
      pushToMostRelevantProcess();
    } else if (pages && pages?.length > 0) {
      pushToMostRelevantPage();
    }
  }, [processes, pages]);

  return null;
}
