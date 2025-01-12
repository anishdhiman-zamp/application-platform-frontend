import React, { ReactElement } from 'react';
import DataHome from 'modules/data';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Home = () => {
  return (
    <DataHome />
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
