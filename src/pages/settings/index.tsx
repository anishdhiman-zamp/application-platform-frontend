import React, { ReactElement } from 'react';
import DashboardLayout from 'components/layouts/dashboard-layout';

const Settings = () => {
  return (
    <div className='border border-GRAY_400 text-center flex justify-center items-center bg-white h-full rounded-tl-md'>
      <div className='f-40-800 text-GRAY_1000'>Settings</div>
    </div>
  );
};

Settings.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default Settings;
