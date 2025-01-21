import React, { ReactElement } from 'react';
import PeoplePage from 'modules/people/PeoplePage';
import DashboardLayout from 'components/layouts/dashboard-layout';

const People = () => {
  return (
    <div className='bg-white h-full'>
      <PeoplePage />
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
