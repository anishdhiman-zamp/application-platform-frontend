'use client';

import { useEffect } from 'react';
import { useGetPagesQuery } from '@/apis/pages';
import { usePersistedPageNavigation } from '@/hooks/useLastVisitedPage';

export default function Page() {
  const { data: pages } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const { pushToMostRelevantPage } = usePersistedPageNavigation({ pagesList: pages ?? [] });

  useEffect(() => {
    if (pages) {
      pushToMostRelevantPage();
    }
  }, [pages]);

  return null;
}
