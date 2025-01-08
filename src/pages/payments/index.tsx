import React, { ReactElement } from 'react';
import { AgCharts } from 'ag-charts-react';
import { barGraph } from 'constants/chartmockData';
import DashboardLayout from 'components/layouts/dashboard-layout';
import 'ag-charts-enterprise';


const Payments = () => {
  return (
    <div className='text-center bg-white h-full rounded-tl-md'>
      <div className='f-40-800 text-GRAY_1000'>Payments</div>
      <AgCharts options={barGraph} />
    </div>
  );
};

Payments.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Payments;
