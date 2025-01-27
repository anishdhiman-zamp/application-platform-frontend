import React, { ReactElement } from 'react';
// import AGChartsWidgets from 'modules/widgets/AGChartsWidgets';
import DashboardLayout from 'components/layouts/dashboard-layout';
import 'ag-charts-enterprise';

const Payments = () => {
  return <div className='text-center bg-white h-full rounded-tl-md'>{/* <AGChartsWidgets /> */}</div>;
};

Payments.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Payments;
