import React, { ReactElement } from 'react';
import DashboardLayout from 'components/layouts/dashboard-layout';

const People = () => {
  return (
    <div className='bg-white h-full p-10'>
      <div className='f-20-600 text-GRAY_1000'>Settings</div>
    </div>
  );
};

People.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default People;
