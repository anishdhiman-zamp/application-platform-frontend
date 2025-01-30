import React, { ReactElement } from 'react';
import { useGetPagesQuery } from 'apis/pages';
import { COLORS } from 'constants/colors';
import { usePersistedPageNavigation } from 'hooks/useLastVisitedPage';
import ProgressBar from 'components/common/RingProgress';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Home = () => {
  const { data: pages, isLoading } = useGetPagesQuery(undefined, {
    refetchOnMountOrArgChange: false,
  });

  const { pushToMostRelevantPage } = usePersistedPageNavigation(pages ?? []);

  React.useEffect(() => {
    if (pages) {
      pushToMostRelevantPage();
    }
  }, [pages]);

  return (
    <div className='flex justify-center items-center h-full'>
      {isLoading || (pages || []).length > 0 ? (
        <ProgressBar
          trackColor={COLORS.BLACK}
          indicatorColor={COLORS.WHITE}
          indicatorWidth={10}
          trackWidth={5}
          className='animate-spin'
          size={100}
          progress={30}
        />
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
