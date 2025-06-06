'use client';

import { useEffect } from 'react';
import { useGetPagesQuery } from '@/apis/pages';
import DynamicLottiePlayer from '@/components/DynamicLottiePlayer';
import { ZAMP_LOGO_LOADER } from '@/constants/lottie/zamp-logo-loader';
import { usePersistedPageNavigation } from '@/hooks/useLastVisitedPage';

export default function Page() {
  const { data: pages, isLoading } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const { pushToMostRelevantPage } = usePersistedPageNavigation(pages ?? []);

  useEffect(() => {
    if (pages) {
      pushToMostRelevantPage();
    }
  }, [pages]);

  return (
    <div className='flex h-full items-center justify-center'>
      {isLoading || (pages || [])?.length > 0 ? (
        <div className='z-50 flex h-[calc(100vh-200px)] w-full items-center justify-center bg-white'>
          <DynamicLottiePlayer src={ZAMP_LOGO_LOADER} className='lottie-player h-[140px]' autoplay loop keepLastFrame />
        </div>
      ) : (
        <p>No Pages Found</p>
      )}
    </div>
  );
}
