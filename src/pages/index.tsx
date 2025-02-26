import React, { ReactElement, useEffect } from 'react';
import { useGetPagesQuery } from 'apis/pages';
import { ZAMP_LOADER } from 'constants/icons';
import { usePersistedPageNavigation } from 'hooks/useLastVisitedPage';
import Image from 'next/image';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Home = () => {
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
    <div className='flex justify-center items-center h-full'>
      {isLoading || (pages || []).length > 0 ? (
        <div className='flex justify-center items-center h-[calc(100vh-200px)] w-full z-50 bg-white'>
          <Image unoptimized src={ZAMP_LOADER} alt='widget-loader' width={140} height={140} />
        </div>
      ) : (
        <p>No Pages Found</p>
      )}
    </div>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Home;
