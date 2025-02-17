import React, { ReactElement, useEffect } from 'react';
import { useAppDispatch } from 'hooks/toolkit';
import Listing from 'modules/data';
import { resetBreadcrumb } from 'store/slices/layout-configs';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Home = () => {
  const appDispatch = useAppDispatch();

  useEffect(() => {
    appDispatch(resetBreadcrumb([]));
  }, []);

  return <Listing />;
};

Home.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Home;
