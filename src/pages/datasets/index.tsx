import React, { ReactElement } from 'react';
import Listing from 'modules/data';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Home = () => {
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
