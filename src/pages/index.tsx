import React, { ReactElement } from 'react';
import { dummyColumns, dummyData } from 'modules/data/data.constants';
import AgGridTable from 'components/common/organisms/agGridTable/AgGridTable';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Home = () => {
  return (
    <div className='border border-GRAY_400 bg-white h-full rounded-tl-md'>
      <AgGridTable columnDefs={dummyColumns} data={dummyData} />
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
