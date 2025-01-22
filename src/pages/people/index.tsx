import React, { ReactElement } from 'react';
import PeoplePage from 'modules/people/PeoplePage';
import DashboardLayout from 'components/layouts/dashboard-layout';

const People = () => {
  return <PeoplePage />;
};

People.getLayout = function getLayout(page: ReactElement) {
  return (
    <div>
      <DashboardLayout>{page}</DashboardLayout>
    </div>
  );
};

export default People;
